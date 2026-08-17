# Deploying

Two services, both from GitHub, no Docker anywhere:

| What | Where | Built from | URL |
| --- | --- | --- | --- |
| Website **+ CMS** | Vercel | `client/` | `drnamanaggarwal.com` and `/admin` |
| API | Google Cloud Run | `server/` | `https://<service>.run.app` |

Everything a browser loads is the frontend: the public React site *and* the CMS
(`client/public/admin`). The backend is a pure JSON API — it serves no HTML.

`client/` and `server/` are independent npm packages with their own lockfiles,
so each platform builds only the folder it needs.

Vercel proxies `/api` through to Cloud Run. That keeps the CMS on the same
origin as the API, which matters: the login refresh token is an httpOnly
cookie, and same-origin makes it a first-party cookie that no browser blocks.

---

## Step 0 — push first

Cloud Build reads GitHub, not your laptop. Commit and push before deploying,
or it will build an old tree:

```bash
git add -A
git commit -m "Backend, CMS, and workspace build config"
git push origin main
```

---

## Step 1 — Cloud Run

**Console → Cloud Run → Create service**

### Source

Choose **"Continuously deploy from a repository (source or function)"** →
**GitHub** → *Set up with Cloud Build* → authorise and pick your repository.

### Build Configuration

| Field | Value |
| --- | --- |
| Branch | `^main$` |
| Build Type | **Google Cloud buildpacks** (not Dockerfile) |
| Build context directory | `/server` |
| Entrypoint | *leave blank* |
| Function target | *leave blank* |

Buildpacks then run, inside `server/` only:

```
npm ci        → installs the backend's dependencies
npm start     → node src/index.js
```

The React app is never built here — Vercel does that. With no `client/dist`
present the server logs a notice, serves the API and CMS as normal, and
redirects `/` to `/admin`.

### Configure

| Field | Value | Why |
| --- | --- | --- |
| Service name | `dr-naman-server` | Cannot be changed later |
| **Region** | **`asia-south1` (Mumbai)** | Patients are in Delhi — the default Belgium region adds ~150ms to every request |
| **Authentication** | **Allow public access** | Without this every request returns 403 |
| Billing | Request-based | Cheapest; only charged while handling requests |
| Min instances | `0` | Stays inside the free tier. Set `1` to avoid ~3s cold starts |
| Ingress | All | |

### Environment variables

Expand **Containers, Networking, Security → Variables & Secrets**, then add:

```
NODE_ENV            production
MONGODB_URI         mongodb+srv://…            (from server/.env)
JWT_ACCESS_SECRET   <64-char hex>              (from server/.env)
JWT_REFRESH_SECRET  <different 64-char hex>    (from server/.env)
COOKIE_SECURE       true
CORS_ORIGINS        https://drnamanaggarwal.com
```

> These are **required**. The server deliberately refuses to start in
> production with default secrets, so a missing `JWT_ACCESS_SECRET` shows up as
> a failed revision, not a silently insecure deploy.

Do **not** set `PORT` — Cloud Run injects it.

Click **Create**.

---

## Step 2 — let Atlas accept the connection

MongoDB Atlas blocks unknown IPs, and Cloud Run's egress addresses are dynamic.

**Atlas → Network Access → Add IP Address → Allow access from anywhere
(`0.0.0.0/0`)**

Without this the service deploys but every request fails with a database
timeout. For a static egress IP instead, attach a VPC connector with Cloud NAT.

---

## Step 3 — verify

Once the revision goes green, open:

```
https://<your-service>.run.app/api/health
```

Expected:

```json
{ "success": true, "data": { "status": "ok", "db": "connected", … } }
```

If `db` is not `connected`, it is almost always Step 2.

Then check:

| URL | Expect |
| --- | --- |
| `/api/health` | `db: "connected"` |
| `/api/public/home` | JSON with 12 treatments |
| `/` | A small JSON service descriptor |
| `/admin` | **404 — correct.** The CMS is part of the frontend |

---

## Step 4 — connect the frontend to the API

Copy your Cloud Run URL into `client/vercel.json`, replacing both occurrences
of the placeholder:

```
YOUR-CLOUD-RUN-URL.run.app   →   your-service-abc123.run.app
```

Those two rewrites forward `/api` and `/uploads` to the backend. Commit and
push; Vercel redeploys automatically.

Then in **Cloud Run → Edit & Deploy New Revision → Variables**, add:

```
PUBLIC_URL = https://drnamanaggarwal.com
```

Only knowable after the first deploy; it builds absolute URLs for uploaded
media.

**The CMS is then live at `https://drnamanaggarwal.com/admin`.** Sign in and
change the password immediately under *My Account*.

> At **runtime** you do not need `VITE_API_URL`. The site and the CMS both call
> a relative `/api`, which the proxy forwards — that is what keeps the login
> cookie first-party.
>
> At **build time** you do need it, though, for a different reason:
> `client/scripts/prerender.js` runs after `vite build` and fetches live CMS
> content (via `getBootstrap`/`getHome`/etc.) to bake into each route's static
> HTML, so published changes actually reach crawlers and social-preview cards
> instead of only ever being visible after a client-side fetch. That script runs
> in Node, not a browser, so it has no page origin to resolve a relative `/api`
> against — it needs an absolute URL. Set `VITE_API_URL` as a **Vercel
> Environment Variable** (Project → Settings → Environment Variables, scoped to
> the Build step) to your Cloud Run URL + `/api`, e.g.
> `https://your-service-abc123.run.app/api`.
>
> Without it, prerendering silently falls back to each component's hardcoded
> placeholder content on every build — the site still builds and deploys fine,
> it just means CMS edits (a new video reel, a new testimonial, a new blog
> post) never show up in the prerendered HTML, only after the browser's own
> client-side fetch resolves. Check the Vercel build log for a line starting
> `[prerender]` — it says outright whether that build used live CMS data or the
> static fallback.

---

## Media uploads — Google Cloud Storage

Cloud Run containers have an ephemeral filesystem: with `min instances: 0`
(the cost-saving default from Step 1), an idle instance scales to zero and its
local disk — where an upload was sitting — is wiped. The next request spins up
a brand-new, empty container. In practice this meant an uploaded photo or
video thumbnail could vanish within the same day it was added, sometimes
within minutes.

`server/src/services/media.service.js` now supports Google Cloud Storage as a
persistent alternative, used automatically whenever `GCS_BUCKET` is set —
local dev is unaffected and keeps writing to `./uploads` when it's left unset.
Everything already stored in MongoDB (treatments, posts, testimonials,
settings) is unaffected either way; only the *files themselves* were at risk.

### Set it up (~10 minutes, same GCP project as everything else)

1. **Console → Cloud Storage → Buckets → Create**
   - Name it something like `dr-naman-uploads` (must be globally unique)
   - Region: same as Cloud Run (`asia-south1`) to keep uploads fast
   - Access control: **Uniform** (the default) — this is what the code assumes
   - Public access prevention: **uncheck "Enforce public access prevention"** —
     the uploaded photos need to be publicly viewable on the site

2. **Make the bucket's contents public**: bucket → **Permissions** tab → **Grant
   access** → New principal `allUsers` → Role **Storage Object Viewer** → Save.
   (This makes every file in the bucket readable by anyone with its URL — fine
   here, since everything uploaded through the CMS is public-facing content
   anyway. It does *not* let anyone list, upload, or delete anything.)

3. **Let Cloud Run write to the bucket**: bucket → **Permissions** → **Grant
   access** → add the Cloud Run service's own service account (Cloud Run →
   your service → the account shown under "Security" — usually
   `<PROJECT_NUMBER>-compute@developer.gserviceaccount.com` unless you set a
   custom one) → Role **Storage Object Admin**.

   No downloaded key file, no `GOOGLE_APPLICATION_CREDENTIALS` — Cloud Run's
   attached service account authenticates automatically.

4. **Cloud Run → Edit & Deploy New Revision → Variables**, add:
   ```
   GCS_BUCKET = dr-naman-uploads
   ```
   Deploy. Check the logs for the usual startup lines — no separate
   "GCS enabled" log line exists yet, so the real check is uploading a new
   photo through the CMS and confirming its URL is
   `https://storage.googleapis.com/dr-naman-uploads/...` instead of
   `/uploads/...`.

5. **Anything uploaded before this point is still gone** — the seed photo and
   any uploads lost to the ephemeral disk need to be re-uploaded through the
   CMS once GCS is live. They'll persist this time.

---

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Revision fails, logs say *"Insecure production config"* | JWT secrets not set in Step 1 |
| `/api/health` shows `db: "disconnected"` | Atlas Network Access (Step 2) |
| Every request returns 403 | Authentication was not set to *Allow public access* |
| Build fails at `npm ci` | Push not done, or build context is not `/server` |
| Site loads, API calls fail with CORS | `CORS_ORIGINS` missing the Vercel domain |
