# Dr. Naman Aggarwal — Practice Website

Website and content management system for a urology, andrology and laparoscopic
surgery practice across Delhi (Men's Health Corner and Veena Nursing Home).

```
client/   React 19 + Vite frontend
server/   Node.js + Express + MongoDB API, with a built-in CMS
```

The site, the CMS and the API all share **one base URL**:

| Path | Serves |
| --- | --- |
| `/` | The public site |
| `/admin` | The CMS |
| `/api/*` | The API |
| `/uploads/*` | Uploaded media |
| `/sitemap.xml` `/robots.txt` | Generated from live content |

## Running it

```bash
# Backend + CMS
cd server
cp .env.example .env   # set MONGODB_URI and both JWT secrets
npm install
npm run seed           # migrates the site's content into MongoDB
npm run dev            # http://localhost:5000

# Frontend — separate terminal, for hot reload while editing the site
cd client
npm install
npm run dev            # http://localhost:5173, proxying /api and /admin to :5000
```

Either port works in development. For production, `cd server && npm run serve`
builds the site and serves everything from a single process.

Requires MongoDB — local, or a MongoDB Atlas connection string.

## Documentation

- [server/README.md](server/README.md) — architecture, API reference, roles,
  security notes, deployment
- [server/INTEGRATION.md](server/INTEGRATION.md) — connecting the React
  frontend to the API, component by component
