# PawByTech Frontend

Web application for PawByTech — an AI-powered website audit platform. Dashboard for managing projects, viewing audit reports, tracking issues on a Kanban board, and monitoring site improvement over time.

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
| `/projects/[id]` | Project detail with pages |
| `/projects/[id]/pages/[pageId]` | Page overview (scores, brain, quick actions) |
| `/projects/[id]/pages/[pageId]/history` | Audit history with score trend chart |
| `/projects/[id]/pages/[pageId]/board` | Kanban issue board (drag-and-drop) |
| `/projects/[id]/pages/[pageId]/audits/[auditId]` | Audit report (scores, personas, issues) |
| `/account` | Profile, password, settings |
| `/account/team` | Team management (members, invitations, seats) |
| `/account/billing` | Billing and subscription management |
| `/pricing` | Plan comparison and upgrade |
| `/admin` | Admin overview dashboard |
| `/admin/users` | User management (AG Grid, inline editing) |
| `/admin/analytics` | Conversion funnel, engagement, signups |
| `/admin/revenue` | Billing and revenue stats |
| `/admin/ai-agents` | AI agent cost tracking |
| `/admin/audits` | Audit monitoring |
| `/admin/issues` | Issue analytics |
| `/admin/pages` | Page analytics |
| `/admin/teams` | Team management |
| `/admin/system` | System health, table sizes, failed jobs |
| `/admin/activity` | Activity log feed |

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
| `ScanProgress` | Real-time scan steps with browser frame, exploration viewer |
| `ExplorationViewer` | Live AI exploration log with action labels |
| `ScoreTrendChart` | Reusable Chart.js line chart |
| `BaseDataTable` | Reusable AG Grid wrapper (theme-aware) |
| `BaseSlideover` | Reusable slideover wrapper |
| `ConfirmDialog` | Global confirmation modal via `useConfirm()` |
| `InviteMemberDialog` | Team invite dialog from sidebar |
| `TeamSwitcher` | Workspace switcher in sidebar |
| `ThemeSwitcher` | Light/dark/system theme toggle |
| `BrainFeed` | Project Brain section (narrative, recommendations, alerts) |
| `QuickRescanModal` | Re-audit confirmation with open issues count |

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
| `useWorkspace` | Workspace listing, switching, leaving |
| `useTeam` | Team CRUD, invitations, member management |
| `usePlan` | Billing status, seat purchases, plan checks |
| `useServerDataTable` | Server-side paginated AG Grid tables |

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
