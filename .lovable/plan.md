# Deploy to Vercel + Add README

## What I'll do

1. **Add `vercel.json`** at the project root configured for TanStack Start (Vite) on Vercel:
   - `buildCommand`: `bun run build`
   - `outputDirectory`: `.output/public` (TanStack Start's default)
   - SPA fallback rewrite so deep links work on refresh
   - Framework preset compatible with the existing Vite + TanStack Start setup

2. **Create `README.md`** at the project root with:
   - Project title + short description (CSV Analytics Dashboard: upload, KPIs, charts, insights, upload history & validation)
   - Tech stack (React 19, TanStack Start, Vite 7, Tailwind v4, shadcn/ui, Recharts)
   - Features list (upload + validation, history, dashboard, insights, theme toggle, export)
   - Local dev instructions (`bun install`, `bun run dev`)
   - Build commands (`bun run build`, `bun run build:dev`)
   - Project structure overview (routes, components, lib)
   - **Deploy to Vercel** section — step by step:
     1. Push to GitHub (via Lovable → GitHub → Connect project)
     2. Import the repo on vercel.com → New Project
     3. Framework preset: Other (Vite); build command `bun run build`; output `.output/public`
     4. Click Deploy
   - **Deploy to Netlify** section (keep, since asked previously)
   - **GitHub sync** note (bidirectional sync via Lovable)

## Notes

- Same approach as the Predictive Model project: a `vercel.json` + README, then user connects GitHub and imports into Vercel.
- No app code changes — purely deployment config and docs.
- No environment variables needed (app is fully client-side; no Lovable Cloud enabled).

## Files

- create `vercel.json`
- create `README.md`
