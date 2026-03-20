# Kirkira TM Management

A **Trademark Portfolio Management** web application built for Kirkira Legal Tech. Manage trademarks, track deadlines, handle documents, plan renewals, and visualize your global portfolio — all in one place.

---

## Features

### Module 1 — Trademark Portfolio (`/trademarks`)
- Sortable, filterable table of all trademark records
- Search by mark name or jurisdiction; filter by status
- Add / Edit / Delete trademarks via modal forms
- Full detail page per trademark with key dates, Nice classes, linked documents, and case timeline
- Drag-and-drop document upload with simulated OCR text extraction

### Module 2 — Docketing & Deadlines (`/deadlines`)
- Summary stat cards: Overdue / Due This Week / Due This Month / All Upcoming
- Color-coded urgency rows (red → orange → yellow → green)
- Per-deadline email notification toggle
- Manual deadline entry linked to any trademark

### Module 3 — Document Management (`/documents`)
- Centralized document library across all trademarks
- Filter by document type (Certificate, Office Action, Invoice, Correspondence, Other) or trademark
- Upload via drag-and-drop with 1.5 s OCR simulation
- In-app preview of extracted text

### Module 4 — Renewal Management (`/renewals`)
- Horizon selector: 6 / 12 / 24 months
- Per-mark **Renew** / **Let Expire** decisions with confirmation modals
- Editable estimated fee per mark with totals
- Card grid + summary table views

### Module 5 — World Map (`/map`)
- Interactive SVG world map — countries shaded by trademark density (light → deep orange)
- Hover tooltips with country name, total count, and status breakdown
- Click any country to open a side panel listing its marks
- Filter by status, Nice class, or owner

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + Vite |
| Routing | React Router DOM v7 |
| Server State | TanStack React Query v5 |
| Forms | React Hook Form |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React + FontAwesome |
| Notifications | React Toastify |
| File Upload | React Dropzone |
| World Map | react-simple-maps |
| HTTP | Axios |
| Font | Inter (@fontsource/inter) |

No external UI component libraries (no shadcn, no MUI) — all components are hand-built with Tailwind.

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Brand Orange | `#FFA600` | Primary CTAs, active nav, focus rings |
| Brand Dark | `#C2410C` | Button hover |
| Brand Light | `#FED7AA` | Soft backgrounds |
| Success | `#10B981` | Registered badge |
| Info | `#0EA5E9` | Filed / Published badge |
| Warning | `#F59E0B` | Opposed badge |
| Error | `#EF4444` | Expired badge, delete actions |
| Sidebar | `#1F2937` | Left navigation |
| Body bg | `#F9FAFB` | Page background |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

> `--legacy-peer-deps` is required because `react-simple-maps` declares a peer dependency on React 16–18, while this project uses React 19. The library works correctly with React 19.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # Button, Badge, Card, StatCard, Modal, Spinner
│   ├── layout/          # Navbar, Sidebar, MainLayout
│   └── common/          # ConfirmationModal, SearchInput
├── pages/
│   ├── Trademarks/      # TrademarkList, TrademarkDetail, TrademarkForm
│   ├── Deadlines/       # DeadlineDashboard
│   ├── Documents/       # DocumentList
│   ├── Renewals/        # RenewalDashboard
│   └── Map/             # WorldMapDashboard
├── hooks/               # useTrademarks, useDeadlines, useDocuments
├── data/                # mockTrademarks.js, mockDocuments.js, mockDeadlines.js
├── utils/               # deadlineUtils.js, statusColors.js
├── App.jsx
├── main.jsx
└── index.css            # Tailwind + CSS theme tokens
```

---

## Mock Data

The app ships with **20 trademark records** spanning **14+ jurisdictions** (US, EU, UK, Germany, France, Japan, China, Australia, India, Brazil, Singapore, South Africa, and more), multiple Nice classes, and all status types. Data is persisted to `localStorage` so decisions (renew/expire, added deadlines, uploaded documents) survive page refreshes.

React Query is used with mock fetcher functions that simulate a short network delay, providing realistic loading states throughout the UI.

---

## Deployment

### Vercel (recommended)

The repo includes a `vercel.json` for React Router SPA support and an `.npmrc` to resolve the `react-simple-maps` peer dependency conflict automatically.

**Git integration:** import your GitHub repo at [vercel.com/new](https://vercel.com/new) — Vercel auto-detects Vite and deploys on every push to `main`. No extra configuration needed.

**CLI:** `npx vercel --prod`

### GitHub Pages

1. Set `base: '/your-repo-name/'` in `vite.config.js`
2. Set `basename="/your-repo-name/"` on `<BrowserRouter>` in `main.jsx`
3. Use the included `.github/workflows/deploy.yml` — enable Pages via **Settings → Pages → GitHub Actions**

---

## License

Private — Kirkira Legal Tech. All rights reserved.
