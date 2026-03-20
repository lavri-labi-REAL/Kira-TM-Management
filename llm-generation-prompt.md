# LLM Prompt: Kirkira Trademark Management Software (Frontend)

---

## Context

You are building a **Trademark Management Software** web application for **Kirkira**, a legal-tech company. This app is a sibling product to an existing platform, so it must share the **exact same design system, colors, fonts, and component patterns** described below.

---

## Design System (Match Exactly)

### Tech Stack
- **React 19** + **Vite** (no Next.js)
- **Tailwind CSS v4** (utility-first, no component libraries like shadcn or MUI)
- **React Router DOM v7** (client-side routing)
- **TanStack React Query v5** (server state / data fetching)
- **React Hook Form** (form handling)
- **Axios** (HTTP)
- **Lucide React** + **FontAwesome** (icons)
- **React Toastify** (notifications, top-right, auto-close 3s)
- **React Dropzone** (file uploads)
- Pure JSX (no TypeScript unless explicitly requested)

### Colors
Use these exact values throughout the UI — no deviation:

| Token | Hex | Usage |
|---|---|---|
| Brand Primary (Orange) | `#FFA600` | Primary CTA buttons, active states, focus rings, badges, highlights |
| Brand Primary Alt | `#F97316` | CSS theme variable `--color-brand-primary` |
| Brand Primary Light | `#FED7AA` | Soft backgrounds, hover fills on light cards |
| Brand Primary Dark | `#C2410C` | Hover state on primary buttons |
| Success | `#10B981` | Status badges: Registered, Renewed |
| Info | `#0EA5E9` | Status badges: Filed, Published |
| Warning | `#F59E0B` | Status badges: Opposed, Pending |
| Error | `#EF4444` | Status badges: Expired, Overdue, Delete confirmations |
| Sidebar bg | `#1F2937` (gray-800) | Left navigation sidebar |
| Body bg | `#F9FAFB` (gray-50) | Page background |
| Card bg | `#FFFFFF` | Card/panel surfaces |
| Border | `#E5E7EB` (gray-200) | Default borders |
| Text Primary | `#111827` (gray-900) | Headings, primary text |
| Text Secondary | `#6B7280` (gray-500) | Labels, subtitles |

**CSS theme block (place in `src/index.css`):**
```css
@import "tailwindcss";

@theme {
  --color-brand-primary: #F97316;
  --color-brand-primary-light: #FED7AA;
  --color-brand-primary-dark: #C2410C;
  --color-brand-success: #10B981;
  --color-brand-info: #0EA5E9;
  --color-brand-warning: #F59E0B;
  --color-brand-error: #EF4444;
  --font-sans: "Inter", sans-serif;
}
```

### Typography
- **Font:** Inter (import from `@fontsource/inter`)
- Headings: `font-bold` or `font-semibold`, sizes from `text-xl` to `text-3xl`
- Body: `text-sm` or `text-base`, color `text-gray-700`
- Labels/meta: `text-xs text-gray-500`

### Component Style Rules

**Buttons:**
```
Primary:   bg-[#ffa600] text-white font-semibold rounded-lg px-4 py-2 hover:bg-[#C2410C] transition-all duration-200
Secondary: border border-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-50
Danger:    bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600
```

**Cards:**
```
bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:-translate-y-1 transition-all duration-300
```

**Inputs / Selects:**
```
w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa600]
```

**Status Badges:**
```
filed:      bg-blue-100 text-blue-700
published:  bg-sky-100 text-sky-700
registered: bg-green-100 text-green-700
opposed:    bg-yellow-100 text-yellow-700
expired:    bg-red-100 text-red-700
```
All badges: `text-xs font-medium px-2.5 py-0.5 rounded-full`

**Modals:**
```
Backdrop:  fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center
Container: bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg
```

**Table rows:**
```
Header row:  bg-gray-50 text-xs text-gray-500 uppercase tracking-wide
Body rows:   hover:bg-gray-50 transition-colors border-b border-gray-100
```

**Toasts:** Use React Toastify — `toast.success()`, `toast.error()`, `toast.info()` at `position="top-right"` with `autoClose={3000}`.

**Focus rings:** Always use `focus:ring-2 focus:ring-[#ffa600]` on interactive elements.

**Animations:** Use `transition-all duration-300 ease-in-out` for hover states. Cards lift with `hover:-translate-y-1`.

### Layout
```
App shell:
┌────────────────────────────────────────┐
│  Navbar (top, white, border-b)         │
├──────────┬─────────────────────────────┤
│ Sidebar  │  Main Content Area          │
│ (gray-   │  (bg-gray-50, p-6)          │
│  800)    │                             │
│  w-64    │                             │
└──────────┴─────────────────────────────┘
```
- **Sidebar:** `bg-gray-800 text-white w-64 min-h-screen` with active link highlighted in `bg-[#ffa600]/20 text-[#ffa600] rounded-lg`
- **Navbar:** `bg-white border-b border-gray-200 px-6 py-3` with logo left, user profile dropdown right
- **Content:** `flex-1 p-6 bg-gray-50 overflow-auto`

---

## Application Requirements

Build the following **5 modules** as a single-page React application with client-side routing:

---

### Module 1: Trademark Portfolio (`/trademarks`)

**List View:**
- Table or card grid of all trademark records
- Columns: Mark Name, Type, Nice Classes, Jurisdiction, Status (badge), Next Deadline, Actions
- Sortable columns, search bar (filter by name/jurisdiction), status filter dropdown
- "Add Trademark" button (primary orange) → opens create modal

**Create / Edit Modal:**
Fields:
- Mark Name (text, required)
- Mark Type (select: Word, Figurative, Combined, Sound, 3D)
- Nice Classes (multi-select, classes 1–45 with descriptions)
- Jurisdiction (searchable country select)
- Filing Date, Publication Date, Registration Date, Renewal Date (date pickers)
- Status (select: Filed, Published, Registered, Opposed, Expired)
- Owner (text or select)
- Notes (textarea)

**Trademark Detail Page (`/trademarks/:id`):**
- Header card: mark name, type badge, status badge, owner
- Info grid: all key dates, jurisdiction, Nice classes
- Linked documents section (upload + list)
- Upcoming deadlines panel (color-coded)
- Case timeline (chronological events)

---

### Module 2: Docketing & Deadline Dashboard (`/deadlines`)

**Dashboard:**
- Summary stats cards: Overdue (red), Due This Week (orange), Due This Month (amber), All Upcoming (blue)
- Deadline table: Mark Name, Deadline Type, Due Date, Days Remaining, Status, Actions
- Color-coded urgency rows: red (overdue/≤7 days), orange (8–30 days), yellow (31–90 days), green (>90 days)
- Filters: date range, deadline type, jurisdiction

**Logic:**
- Auto-calculate renewal deadlines (10 years from registration, or jurisdiction-specific)
- Auto-calculate opposition deadline (typically 3 months from publication date)
- Manual deadline entry: "+ Add Deadline" button → modal with mark selector, type, date, notes
- Email notification toggle per deadline (stored in state/mock)

---

### Module 3: Document & Case Management (`/documents`)

**Document List:**
- Table: File Name, Linked Trademark, Type (tag), Uploaded Date, Actions (preview, download, delete)
- Upload button → React Dropzone area (PDF, image, Word accepted)
- Tag assignment on upload (Office Action, Certificate, Invoice, Correspondence, Other)
- Search/filter by trademark or tag

**Document Preview:**
- Slide-out panel or modal showing PDF/image preview
- For PDFs: use `docx-preview` or embed in `<iframe>`

**Case Timeline (per trademark):**
- Vertical timeline on the trademark detail page
- Each event: date, type icon, description, linked document (optional)
- Add event manually: date, type (Filing, Publication, Opposition, Renewal, Correspondence), notes

**OCR (mock):**
- Show "Extracting text..." spinner on PDF upload
- After 1.5s delay, show mock extracted text in a read-only textarea

---

### Module 4: Renewal & Fee Management (`/renewals`)

**Renewal Dashboard:**
- Horizon tabs: 6 months | 12 months | 24 months
- Cards per upcoming renewal: mark name, jurisdiction, class count, due date, estimated fee, decision buttons
- Decision buttons: "Renew" (green) / "Let Expire" (red) — updates status with confirmation modal
- Renewal fee entry: manual input field per mark

**Renewal Table:**
- Columns: Mark, Jurisdiction, Classes, Due Date, Fee, Decision, Confirmation Upload, Status
- Upload renewal confirmation documents (receipt/invoice) inline

**Stats bar:** Total renewals due, total estimated fees, decisions made (renewed vs. lapsed)

---

### Module 5: World Map Dashboard (`/map`)

**Global Map:**
- Interactive SVG or canvas-based world map (use `react-simple-maps` or `d3-geo`)
- Each country filled with a color gradient based on trademark count (0 = light gray, high = deep orange `#F97316`)
- Hover tooltip: country name, total trademarks, breakdown by status (filed/registered/opposed/expired)
- Click on country → side panel slides in showing list of marks in that jurisdiction

**Filters panel (above map):**
- Filter by: Status, Nice Class, Owner, Year (filed)
- Map updates dynamically on filter change

**Summary stats below map:** Total jurisdictions, total trademarks, most active jurisdiction

---

## State & Data

- Use **mock data** (hardcoded JSON arrays) for all entities — no backend required
- At least 15–20 sample trademark records spanning 8+ countries, multiple Nice classes, varied statuses
- Use **React Query** with mock "fetchers" that return the mock data after a short delay to simulate loading states
- Store user decisions (renew/expire) in local component state or React context
- Use `localStorage` for persistence of mock data across page refreshes (optional but nice)

---

## File Structure

```
src/
├── components/
│   ├── ui/              # Reusable: Button, Badge, Card, Modal, Spinner, Table, Dropdown
│   ├── layout/          # Navbar, Sidebar, MainLayout
│   └── common/          # LogoDisplay, ConfirmationModal, SearchInput
├── pages/
│   ├── Trademarks/      # TrademarkList, TrademarkDetail, TrademarkForm
│   ├── Deadlines/       # DeadlineDashboard
│   ├── Documents/       # DocumentList, DocumentUpload, CaseTimeline
│   ├── Renewals/        # RenewalDashboard
│   └── Map/             # WorldMapDashboard
├── hooks/               # useTrademarks, useDeadlines, useDocuments, useRenewals
├── data/                # mockTrademarks.js, mockDocuments.js, mockDeadlines.js
├── utils/               # deadlineUtils.js (date calculations), statusColors.js
├── context/             # AppContext (global state if needed)
└── index.css            # Tailwind + theme tokens
```

---

## Additional Instructions

1. **No external UI component libraries** — build all components from scratch with Tailwind
2. **Consistent orange accent** — `#FFA600` is the primary brand color; use it for all CTAs, active nav items, focus rings, and key highlights
3. **Responsive** — layouts must work on desktop (1280px+) and tablet (768px). Mobile is secondary.
4. **Loading states** — use a spinner (`animate-spin`) or skeleton placeholders while data loads
5. **Empty states** — show a friendly illustration/message when lists are empty
6. **Confirmation modals** — any destructive action (delete, let expire) must show a confirmation modal before proceeding
7. **Breadcrumbs** — on detail pages show: Home > Trademarks > [Mark Name]
8. **Sidebar navigation** — active route highlighted with `bg-[#ffa600]/20 text-[#ffa600]`
9. **Logo** — use the text "Kirkira TM" styled in `font-extrabold text-[#ffa600]` in the navbar/sidebar header
10. **Toast feedback** — every create/update/delete action fires a toast notification

---

## Deliverable

A fully working React + Vite application with all 5 modules, using mock data, matching the Kirkira design system exactly. The app should be runnable with `npm install && npm run dev`.
