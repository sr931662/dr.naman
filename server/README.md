# Dr. Naman Aggarwal — Backend & CMS

Node.js + Express + MongoDB backend for the practice website, with a built-in
content management system covering every piece of content on the site.

Plain JavaScript (ES modules) throughout — no TypeScript, no build step.

---

## Quick start

```bash
cd server
cp .env.example .env          # then edit MONGODB_URI and the two JWT secrets
npm install
npm run seed                  # migrates the site's existing content into MongoDB
npm run dev
```

Then open **http://localhost:5000/admin** and sign in with the `ADMIN_EMAIL` /
`ADMIN_PASSWORD` from your `.env`. Change that password immediately.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start with auto-reload |
| `npm start` | Start for production |
| `npm run build:client` | Build the React site into `client/dist` |
| `npm run serve` | Build the site, then start — one process serves everything |
| `npm run seed` | Import site content; skips anything that already exists |
| `npm run seed:reset` | Wipe content collections, then re-import |
| `npm run create:admin` | Create or reset the bootstrap admin account |
| `npm test` | End-to-end smoke test against an in-memory MongoDB (83 checks) |

You need MongoDB running locally, or a connection string from MongoDB Atlas.

## One origin for everything

The site, the CMS and the API share a single base URL — no CORS, no cross-site
cookie rules, one thing to deploy.

| Path | Serves |
| --- | --- |
| `/` `/about` `/blog/*` `/treatments/*` | The public React site |
| `/admin` | The CMS |
| `/api/*` | The API |
| `/uploads/*` | Uploaded media |
| `/sitemap.xml` `/robots.txt` | Generated from live content |

**In development** you can use either port — Vite proxies the backend paths, so
`localhost:5173/admin` and `localhost:5000/admin` both reach the CMS:

```bash
cd server && npm run dev      # :5000 — API, CMS, and the built site if present
cd client && npm run dev      # :5173 — site with HMR, proxying the rest to :5000
```

**In production** Express serves `client/dist` itself, so one process on one
domain answers everything:

```bash
cd server && npm run serve    # builds the client, then starts
```

Reserved prefixes (`/api`, `/admin`, `/uploads`, `/sitemap.xml`, `/robots.txt`)
are claimed before the SPA catch-all, so a mistyped API path returns a JSON 404
rather than silently handing back the React shell.

---

## How the CMS works

The core idea: **every content type is declared once**, in
`src/cms/types/*.js`. That single declaration produces, automatically:

- the Mongoose model and its indexes
- request validation with field-level error messages
- a full REST CRUD surface under `/api/cms/:type`
- the public read API under `/api/public/:type`
- the editing form in the admin UI

Adding a content type is one file plus one line in `src/cms/registry.js`. You
never write a route, a model, or a form.

### Declaring a type

```js
import { defineType } from '../defineType.js'

export default defineType({
  name: 'awards',              // API key + Mongo collection
  label: 'Awards',
  group: 'Practice',           // which admin sidebar section it appears under
  icon: '🏆',
  fields: [
    { name: 'title', type: 'string', required: true, listColumn: true },
    { name: 'year',  type: 'number', integer: true, min: 1980 },
    { name: 'body',  type: 'text' },
  ],
})
```

`defineType` adds the system fields implied by its flags — `order` for
orderable types, `status` + `publishedAt` for publishable ones.

### Field types

| Type | Editor widget | Notes |
| --- | --- | --- |
| `string` `text` | input / textarea | `minLength`, `maxLength`, `pattern` |
| `richtext` | WYSIWYG | HTML, sanitised on save |
| `svg` | code + live preview | For the site's inline icons |
| `slug` | text | Auto-derived from the title, de-duplicated |
| `number` `boolean` `date` | native inputs | `min`, `max`, `integer` |
| `select` `multiselect` | dropdown / checkboxes | `options: []` |
| `color` `url` `email` `phone` | validated inputs | |
| `image` | media picker | Stores `{ url, alt, width, height }` |
| `array` | repeatable rows | `of: { … }` — any type, including `object` |
| `object` | grouped sub-fields | `fields: [ … ]` |
| `reference` | dropdown | `refModel: 'Treatments'` |
| `json` | code editor | Escape hatch |

Add a new field type by adding one entry to `src/cms/fieldTypes.js`; models,
validation and the admin form all pick it up.

---

## What is managed

| Group | Types |
| --- | --- |
| **Site** | Site Settings, Navigation, Section Copy, Pages |
| **Home Page** | Hero, Philosophy Cards, Career Timeline, Research & Talks, Credentials Marquee, Video Reels, Photo Gallery, Testimonials |
| **Clinical** | Treatments (12, incl. full patient-education content), Triage Cards, FAQs |
| **Editorial** | Blog Posts |
| **Practice** | Clinic Locations |

Plus, outside the content registry: **Media Library**, **Consultation
Requests**, **Newsletter Subscribers**, **Analytics**, **Activity Log** and
**Team** (user management).

"Section Copy" deserves a note: every section heading, eyebrow and lead
paragraph on the site is a record keyed by a stable id (`home-testimonials`,
`contact-hero`, …), so wording changes never need a code change.

---

## API

### Public — no authentication

Aggregate endpoints, so the site renders with one request per page:

```
GET  /api/public/bootstrap          settings + navigation + all section copy
GET  /api/public/home               the entire home page in one payload
GET  /api/public/contact            clinic locations + contact details
GET  /api/public/:type              published records of a type
GET  /api/public/:type/:slug        one record, with its related items
GET  /api/seo/sitemap.xml           generated from live content
GET  /api/seo/robots.txt
GET  /api/seo/jsonld                Physician structured data
POST /api/appointments              the contact form
POST /api/newsletter/subscribe
POST /api/analytics/track           cookieless page-view beacon
```

Drafts are never returned by anything under `/api/public`, and editorial
metadata (`createdBy`, `updatedBy`) is stripped before sending.

### Authenticated — the CMS

```
POST   /api/auth/login              → { user, accessToken } + refresh cookie
POST   /api/auth/refresh            rotates the session
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/cms/schema              every type's field definitions
GET    /api/cms/dashboard           counts + recent activity
GET    /api/cms/activity            the audit log

GET    /api/cms/:type               list (page, limit, search, status, sort, filter)
POST   /api/cms/:type               create
GET    /api/cms/:type/:id           read
PUT    /api/cms/:type/:id           replace
PATCH  /api/cms/:type/:id           partial update
DELETE /api/cms/:type/:id           delete
POST   /api/cms/:type/:id/status    publish / unpublish / archive
POST   /api/cms/:type/:id/duplicate
POST   /api/cms/:type/reorder       drag-and-drop ordering
POST   /api/cms/:type/bulk-delete

GET    /api/media                   media library
POST   /api/media                   multipart upload (up to 10 files)
GET    /api/appointments            consultation requests
GET    /api/appointments/export/csv
GET    /api/analytics/summary?days=30
```

Single types (`settings`, `navigation`, `hero`) are read and written without an
id: `GET /api/cms/settings`, `PUT /api/cms/settings`.

### Response shape

```jsonc
// success
{ "success": true, "data": … , "meta": { "page": 1, "total": 12, … } }

// failure
{ "success": false, "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": { "title": "Title is required" }
} }
```

`details` is keyed by dotted path (`faqs.0.q`), which is what lets the admin UI
highlight the exact input that failed.

---

## Roles

| Role | Can do |
| --- | --- |
| `admin` | Everything, including managing the team |
| `editor` | Create, edit, publish and delete content and media |
| `author` | Create and edit content — cannot publish or delete |
| `viewer` | Read-only |

Routes check capabilities (`content.publish`, `media.delete`), not role names —
see `PERMISSIONS` in `src/models/User.js`.

---

## Security notes

- **Passwords** — bcrypt at cost 12; 10+ chars with mixed case and a digit;
  five failed attempts locks the account for 15 minutes.
- **Sessions** — short-lived JWT access token held in memory by the admin UI,
  plus a hashed, rotating refresh token in an httpOnly cookie. Re-using a
  revoked refresh token is treated as theft and kills every session for that
  user.
- **HTML** — all rich text is sanitised server-side against an allow-list, so a
  compromised editor account cannot inject a script into the public site.
- **Uploads** — images are re-encoded through sharp, which resizes them and
  strips EXIF. Clinic photos do not carry GPS coordinates onto a public page.
- **Patient data** — consultation requests contain symptom descriptions. They
  are never exposed on any public route, and the CSV export escapes leading
  `=`/`+`/`-`/`@` so a submitted formula cannot execute in a spreadsheet.
- **Analytics** — no cookies, no third party. Visitors are counted by a salted
  hash that rotates daily, so nobody can be tracked across days or sites.
- **Rate limits** — 10 sign-in attempts / 15 min, 8 contact-form posts / hour,
  600 API requests / 15 min.

In production the server refuses to start if the JWT secrets are still at their
development defaults.

---

## Layout

```
server/
├─ src/
│  ├─ cms/
│  │  ├─ fieldTypes.js      field-type registry (storage + validation + widget)
│  │  ├─ defineType.js      normalises a content-type declaration
│  │  ├─ modelFactory.js    declaration → Mongoose model
│  │  ├─ validator.js       payload → validated value + field errors
│  │  ├─ registry.js        all types, and the schema manifest
│  │  └─ types/             one file per content type
│  ├─ models/               User, Media, Appointment, AuditLog, …
│  ├─ services/             content, auth, media, mail, audit, cache
│  ├─ routes/               auth, cms, public, media, appointments, seo, …
│  ├─ middleware/           auth, rate limits, error handling
│  ├─ seed/                 the migration of the site's hard-coded content
│  └─ scripts/              createAdmin, smoke test
└─ public/admin/            the CMS UI — plain ES modules, no build step
```

---

## Deploying

1. Set `NODE_ENV=production` and real values for both JWT secrets
   (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
2. Point `MONGODB_URI` at Atlas or your managed instance.
3. Set `CORS_ORIGINS` to the site's real domain, and `COOKIE_SECURE=true`.
4. Set `PUBLIC_URL` to the API's public origin so media URLs resolve.
5. `npm ci && npm run seed && npm start` behind a TLS-terminating proxy.

`uploads/` holds user-uploaded media — put it on a persistent volume, or swap
`src/services/media.service.js` for S3/Cloudinary if the host has ephemeral
disk.

See [INTEGRATION.md](./INTEGRATION.md) for wiring the React frontend to this API.
