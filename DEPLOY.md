# Deploying

Two services, both from GitHub, no Docker anywhere:

| What | Where | URL |
| --- | --- | --- |
| Public website | Vercel | `drnamanaggarwal.com` |
| API + CMS | Google Cloud Run | `https://<service>.run.app` |

Cloud Run also serves a copy of the website, which is handy for verifying a
deploy before pointing anything at it.

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
| Build context directory | `/` |
| Entrypoint | *leave blank* |
| Function target | *leave blank* |

The context must be `/`, not `/server` — the build needs `client/` too, because
`npm run build` compiles the React site that Express serves.

Buildpacks then run, from the repository root:

```
npm ci          → installs both workspaces
npm run build   → builds client/dist
npm start       → node server/src/index.js
```

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
| `/admin` | CMS login screen |
| `/api/public/home` | JSON with 12 treatments |
| `/` | The website |

**The CMS is now live at `https://<your-service>.run.app/admin`.**
Sign in, then change the password immediately under *My Account*.

---

## Step 4 — point the website at the API

In **Vercel → Project → Settings → Environment Variables**:

```
VITE_API_URL = https://<your-service>.run.app/api
```

Redeploy — Vite bakes this in at build time, so a redeploy is required, not
just a restart.

Then back in **Cloud Run → Edit & Deploy New Revision → Variables**, add:

```
PUBLIC_URL = https://<your-service>.run.app
```

That one is only knowable after the first deploy; it is used to build absolute
URLs for uploaded media.

---

## Optional — CMS on your own domain

To reach the CMS at `drnamanaggarwal.com/admin` instead of the `run.app` URL,
add these to `client/vercel.json` **above** the existing SPA rewrite, replacing
the host with your real service URL:

```json
{ "source": "/admin",        "destination": "https://<service>.run.app/admin" },
{ "source": "/admin/:path*", "destination": "https://<service>.run.app/admin/:path*" },
{ "source": "/uploads/:path*","destination": "https://<service>.run.app/uploads/:path*" }
```

Not required — the `run.app` URL works fine and is a reasonable place to
bookmark an internal tool.

---

## Known limitation: media uploads

Cloud Run containers have an ephemeral filesystem. Uploaded images survive
until the instance restarts or scales down, then disappear.

Everything stored in MongoDB — treatments, blog posts, testimonials,
appointments, settings — is unaffected.

To fix properly, swap the storage layer in
`server/src/services/media.service.js` for Google Cloud Storage. It is isolated
to `store()` and `destroy()`.

---

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Revision fails, logs say *"Insecure production config"* | JWT secrets not set in Step 1 |
| `/api/health` shows `db: "disconnected"` | Atlas Network Access (Step 2) |
| Every request returns 403 | Authentication was not set to *Allow public access* |
| Build fails at `npm run build` | Push not done, or build context is `/server` instead of `/` |
| Site loads, API calls fail with CORS | `CORS_ORIGINS` missing the Vercel domain |
