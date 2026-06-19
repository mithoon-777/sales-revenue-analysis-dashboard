# Sales & Revenue Analytics 

## Live Demo

https://sales-revenue-analysis-dashboard-neon.vercel.app/

## Overview

Developed an interactive Sales & Revenue Analysis Dashboard using Lovable AI and modern web technologies. Implemented KPI tracking, revenue trend analysis, product performance visualization, and interactive filtering to generate actionable business insights. Deployed the application on Vercel and managed source control through GitHub.

Built with **React 19**, **TanStack Start**, **Vite 7**, **Tailwind CSS v4**, **shadcn/ui**, and **Recharts**.

---

## ✨ Features

- 📤 **Upload & validation** — CSV/XLSX upload with size, type, header, and row checks
- 🕒 **Upload history** — keeps recent uploads so you can switch datasets quickly
- 📊 **Dashboard** — KPI cards, line / bar / pie charts, dynamic filters
- 💡 **Insights panel** — auto-generated trends, top/bottom performers, outliers
- 🎨 **Light / dark theme** toggle
- 📥 **Export** to CSV and PDF
- ⚡ Fully client-side — no backend required

---

## 🚀 Local development

```bash
# Install dependencies
npm install        # or: bun install

# Start the dev server
npm run dev        # http://localhost:8080

# Production build
npm run build

# Preview the production build
npm run preview
```

---

## 📁 Project structure

```
src/
├── routes/                 # File-based routes (TanStack Router)
│   ├── __root.tsx          # Root layout (sidebar, theme, providers)
│   ├── index.tsx           # Dashboard
│   ├── upload.tsx          # Upload + history + validation
│   └── insights.tsx        # Auto-generated insights
├── components/
│   ├── dashboard/          # KPI cards, charts, filters, insights
│   ├── ui/                 # shadcn/ui primitives
│   ├── app-sidebar.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── parse.ts            # CSV/XLSX parsing + validation
│   ├── store.ts            # Zustand store (data + history)
│   ├── analytics.ts        # KPI / aggregation helpers
│   ├── export.ts           # CSV / PDF export
│   ├── sample-data.ts
│   └── types.ts
└── styles.css              # Tailwind v4 tokens & theme
```

---

## ☁️ Deploy to Vercel

This repo includes a `vercel.json` pre-configured for TanStack Start.

### 1. Push the code to GitHub

In Lovable: **+ (plus menu) → GitHub → Connect project → Create Repository**.
Changes sync between Lovable and GitHub automatically in both directions.

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Click **Import** next to your repository.
3. Vercel auto-detects the settings from `vercel.json`:
   - **Build command:** `npm run build`
   - **Install command:** `npm install`
   - **Env var:** `NITRO_PRESET=vercel`
4. Click **Deploy**.

Your app goes live at `https://<project-name>.vercel.app` in ~1 minute. Every push to the main branch triggers a new deployment automatically.

### 3. (Optional) Custom domain

Project → **Settings → Domains → Add** and follow the DNS instructions.

---

## 🌐 Deploy to Netlify

The repo also includes `netlify.toml` for one-click Netlify deploys.

1. Push to GitHub (same step as above).
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
3. Pick the repository — Netlify reads `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy**.

---

## 🔁 GitHub ↔ Lovable sync

Once connected, the integration is **bidirectional**:

- Edits in Lovable → auto-commit & push to GitHub.
- Pushes to GitHub → auto-sync back to Lovable.

You can develop locally, in Lovable, or both at the same time.

---

## 📜 Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the dev server on port 8080    |
| `npm run build`    | Production build                     |
| `npm run build:dev`| Development-mode build               |
| `npm run preview`  | Preview the production build         |
| `npm run lint`     | Run ESLint                           |
| `npm run format`   | Format with Prettier                 |

---

## 🛠 Tech stack

- React 19 + TypeScript
- TanStack Start / Router / Query
- Vite 7
- Tailwind CSS v4 + shadcn/ui + lucide-react
- Recharts (charts), Zustand (state), Zod (validation)
- PapaParse + xlsx (file parsing), jsPDF (export)

---

Built with ❤️ on [Lovable](https://lovable.dev).
