# GhostAudit Frontend

Web application for GhostAudit — an AI-powered website audit platform. Dashboard for managing projects, viewing audit reports, tracking issues on a Kanban board, and monitoring site improvement over time.

## Stack

- **Nuxt 4** / **Vue 3** / **TypeScript**
- **Nuxt UI v4** — component library (Radix-based)
- **Tailwind CSS v4** — styling
- **Pinia** — state management
- **Zod** — form validation
- **Chart.js** / **vue-chartjs** — score trend charts
- **AG Grid** — data tables (audit history)
- **vue-draggable-plus** — Kanban drag-and-drop
- **Pusher.js v7** — WebSocket (real-time scan progress via Laravel Reverb)
- **date-fns** — date formatting
- **vue-i18n** — internationalization (English, extensible)

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Login |
| `/register` | Registration |
| `/auth/verify-email` | Email verification |
| `/auth/forgot-password` | Password reset request |
| `/auth/reset-password` | Password reset |
| `/dashboard` | Project grid with scores |
| `/projects/new` | Create project |
| `/projects/[id]` | Project overview (stats, brain feed, quick actions) |
| `/projects/[id]/history` | Audit history with score trend chart and AG Grid table |
| `/projects/[id]/board` | Kanban issue board (drag-and-drop, filters, detail slideover) |
| `/projects/[id]/audits/[auditId]` | Audit report (scores, personas, issues, brain narrative) |
| `/account` | Profile, password, settings |

## Key Components

| Component | Description |
|-----------|-------------|
| `ScoreDashboard` | Animated score counter, 5 sub-score cards, sparkline |
| `PersonaCard` | Persona verdict with narrative modal |
| `TopIssuesSummary` | Top 5 issues with badges |
| `FiveSecondTest` | Visual analysis first-impression card |
| `AuditNarrative` | Brain progress narrative with momentum badge |
| `KanbanBoard` | Drag-and-drop issue board with filters |
| `IssueCard` | Compact issue card with badges and persona icons |
| `IssueDetailSlideover` | Full issue detail with timeline and action buttons |
| `ScanProgress` | Real-time scan steps with agent progress bar |
| `ScoreTrendChart` | Reusable Chart.js line chart |
| `BaseDataTable` | Reusable AG Grid wrapper (theme-aware) |
| `BaseSlideover` | Reusable slideover wrapper |
| `ConfirmDialog` | Global confirmation modal via `useConfirm()` |
| `ThemeSwitcher` | Light/dark/system theme toggle |
| `BrainFeed` | Project Brain section (narrative, recommendations, alerts) |

## Composables

| Composable | Description |
|------------|-------------|
| `useApi` | `$fetch` wrapper with auth token and 401 handling |
| `useAuth` | Login, register, logout, password flows |
| `useAuthToken` | Cookie-based token (SSR-compatible) |
| `useApiError` | Parse API errors with field-level messages |
| `useConfirm` | Promise-based confirmation dialog |
| `useFormatters` | Date, time, duration formatting (locale-aware) |
| `useProjectOptions` | Translatable site type and conversion goal options |
| `useScoreLabel` | Score level labels (Good/Needs improvement/Poor) |
| `useScanProgress` | WebSocket + polling for real-time scan progress |

## Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone git@github.com:Dodera-Software/dodera-audit-frontend.git
cd dodera-audit-frontend
npm install
```

### Environment

```bash
cp .env.example .env
```

Key variables:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
NUXT_PUBLIC_REVERB_KEY=your-reverb-key
NUXT_PUBLIC_REVERB_HOST=localhost
NUXT_PUBLIC_REVERB_PORT=8080
```

### Development

```bash
npm run dev
```

App runs at `http://localhost:3000`. Requires the API backend running at port 8000.

### Build

```bash
npm run build
npm run preview  # Preview production build
```

## i18n

All user-facing text uses `t()` for internationalization. Extract new keys:

```bash
npm run i18n-extract
```

Locale files: `i18n/locales/en.json`

## Project Structure

```
app/
  assets/css/        # Tailwind + Nuxt UI imports
  components/
    audit/           # Audit report components
    board/           # Kanban board components
    brain/           # Brain feed components
  composables/       # Shared composables
  constants/         # Typed constants (scores, severity, personas, etc.)
  layouts/           # Default + auth layouts
  middleware/        # Auth + guest route guards
  pages/             # File-based routing
  plugins/           # Auth client plugin
  schemas/           # Zod validation schemas
  stores/            # Pinia stores
i18n/
  locales/           # Translation files
```
