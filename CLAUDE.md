# CLAUDE.md — GhostAudit Frontend

Conventions and rules for all development on this project.
Read this before writing any code. These rules are non-negotiable.

---

## Stack

- Nuxt 4 · Vue 4 · TypeScript (strict) · Tailwind CSS
- Pinia (state) · VueUse · Chart.js · vue-draggable-plus
- Laravel Echo + Pusher JS (WebSockets)
- <script setup> syntax only — never Options API, never class components

---

## The absolute rules

I prefer early return in ifs where possible to clean up the code.
First is template, then script then style tags in files.
Extract and reuse logic in composables, components etc to keep everything clean and easy to mantain and readable.
Use libraries instead of reinventing the wheel, like date-fns and other popular ones even for basic stuff.
Use named functions instead of const functions.
Reuse where possible, do not repeat yourself, code as clean as possible, professional!!!

**Never use `any`.** Every variable, prop, return type, and ref must be 
typed. If you reach for `any`, stop and define the correct type in 
types/index.ts instead.

**Never write inline styles.** Use Tailwind classes only. If a value 
cannot be expressed in Tailwind, add it to tailwind.config.ts as a 
design token. The only exception is dynamic values that cannot be 
expressed statically (e.g. a width calculated from a percentage at 
runtime) — in that case use a CSS variable set via :style binding.

**Never hardcode colors, font names, or spacing values in templates.**  
Always use Tailwind tokens (ghost-400, surface-1, font-display, etc.)

**Never call the API from a component.** Components call store actions 
or composables. Stores and composables call useApi(). The component 
never touches $fetch or useApi() directly.

**Never put business logic in templates.** Template expressions must be 
trivial: display a value, negate a boolean, call an action on click. 
Any logic beyond that belongs in a computed property or a composable.

**Never use `<script>` without `setup`.** Always `<script setup lang="ts">`.

**Never commit console.log.** Use a logger composable or remove before 
committing.

---

## File and component structure
```
assets/
  css/main.css          — base styles and @layer components only

components/
  ui/                   — design system primitives (Button, Badge, Card,
  |                       Input, Modal, Skeleton, etc.)
  |                       These components know nothing about GhostAudit
  |                       domain logic. They are generic.
  audit/                — audit-specific components (PersonaCard, 
  |                       ScoreDashboard, AnnotatedScreenshot, etc.)
  board/                — kanban components (IssueCard, IssueDetailPanel,
                          KanColumn, etc.)

composables/
  useApi.ts             — typed HTTP client, auth injection, 401 handling
  useEcho.ts            — WebSocket client, channel subscriptions
  useToast.ts           — toast notification state and helpers
  useClipboard.ts       — copy to clipboard with feedback state

layouts/
  default.vue           — authenticated app shell (sidebar + topbar)
  auth.vue              — centred card for login/register
  public.vue            — minimal header for landing + shared pages

pages/                  — one file per route, thin orchestration only

stores/
  auth.ts
  project.ts
  audit.ts

types/
  index.ts              — all interfaces, types, and enums
```

---

## Component rules

### Single responsibility

Every component does one thing. If a component template exceeds 80 lines
or has more than 4 props, it is doing too much — split it.

### Props are typed and documented
```typescript
// Good
interface Props {
  score: number          // 0–100
  previousScore?: number // shown as delta if provided
  isLoading?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

// Bad
const props = defineProps(['score', 'previousScore', 'isLoading'])
```

### Emit signatures are typed
```typescript
const emit = defineEmits<{
  'select-issue': [issueId: string]
  'status-change': [issueId: string, status: IssueStatus]
}>()
```

### Computed over methods for derived display values
```typescript
// Good
const scoreColor = computed(() => {
  if (props.score >= 70) return 'text-success'
  if (props.score >= 40) return 'text-warning'
  return 'text-danger'
})

// Bad — recalculates on every render
const getScoreColor = (score: number) => { ... }
```

### Composables extract reusable logic

If the same reactive logic (a watcher, a fetch pattern, a computed 
chain) appears in more than one component, it becomes a composable.
```typescript
// composables/useIssueFilter.ts
export function useIssueFilter(issues: Ref<Issue[]>) {
  const activeCategories = ref<IssueCategory[]>([])
  const activeSeverities = ref<IssueSeverity[]>([])

  const filtered = computed(() =>
    issues.value.filter(issue => {
      const categoryMatch = !activeCategories.value.length || 
        activeCategories.value.includes(issue.category)
      const severityMatch = !activeSeverities.value.length || 
        activeSeverities.value.includes(issue.severity)
      return categoryMatch && severityMatch
    })
  )

  return { activeCategories, activeSeverities, filtered }
}
```

---

## Pinia stores

Stores own all server state. They are the single source of truth.
Components read from stores via `storeToRefs()`. 
Components trigger changes via store actions.
```typescript
// In a component — good
const { currentAudit, isScanning } = storeToRefs(useAuditStore())
const { triggerAudit } = useAuditStore()

// In a component — bad (fetching directly)
const audit = ref(null)
onMounted(async () => {
  audit.value = await useApi()('/api/audits/123')
})
```

Store actions handle loading state and errors themselves:
```typescript
async fetchAudit(auditId: string): Promise<void> {
  this.isLoading = true
  try {
    const data = await useApi()<{ data: Audit }>(`/api/audits/${auditId}`)
    this.currentAudit = data.data
  } catch (error) {
    useToast().error('Failed to load audit')
    throw error  // re-throw so the caller knows it failed
  } finally {
    this.isLoading = false
  }
}
```

---

## Tailwind usage

Use only tokens defined in tailwind.config.ts.
Never use arbitrary values like `bg-[#a78bfa]` — add a token instead.
Never use `style=""` for anything expressible as a Tailwind class.

Group classes in this order in templates:
1. Layout (flex, grid, block, hidden, w-, h-, p-, m-)
2. Typography (font-, text-, leading-, tracking-)
3. Colors (bg-, text-, border-)
4. Borders and radius (border, rounded-)
5. Effects (shadow, opacity, transition, animate-)
6. Interactive states (hover:, focus:, active:, disabled:)
7. Responsive (sm:, md:, lg:, xl:)

For long class strings, use the cn() helper (install clsx + 
tailwind-merge if needed) to split across lines:
```typescript
const cardClass = computed(() =>
  cn(
    'card p-4 transition-all',
    props.isSelected && 'border-ghost-400 bg-ghost-400/5',
    props.isLoading && 'opacity-50 pointer-events-none',
  )
)
```

---

## The useApi composable

Every API call goes through useApi(). Never use $fetch directly.
```typescript
// Good
const api = useApi()
const project = await api<{ data: Project }>(`/api/projects/${id}`)

// Bad
const project = await $fetch(`http://localhost:8000/api/projects/${id}`)
```

Handle errors at the store level, not in components.
The composable handles 401 globally (redirects to login).
All other errors propagate and are caught in the store action.

---

## Layouts and pages

Pages are orchestrators: they get route params, call store actions 
on mount, and pass data down to components. They contain minimal 
template logic.
```vue
<!-- pages/projects/[id]/audits/[auditId].vue -->
<script setup lang="ts">
const route = useRoute()
const auditStore = useAuditStore()
const { currentAudit, isScanning } = storeToRefs(auditStore)

onMounted(() => auditStore.fetchAudit(route.params.auditId as string))
</script>

<template>
  <div>
    <ScanProgress v-if="isScanning" />
    <AuditReport v-else-if="currentAudit" :audit="currentAudit" />
  </div>
</template>
```

The page does not know how to render a persona card. 
The page does not know what an annotated screenshot looks like.
The page just decides what top-level component to show.

---

## UI components (components/ui/)

These components are design-system primitives. They know nothing about 
GhostAudit domain concepts. They are reusable across any project.

Rules for UI components:
- All visual variation is controlled by props
- No internal API calls, no store access, no route awareness
- No domain-specific copy inside the component (pass via slots or props)
- Accessible by default: correct ARIA roles, keyboard navigable, 
  focus-visible styles applied

Examples of UI components:
- UiButton (variant: primary | ghost | danger)
- UiBadge (variant: critical | high | medium | low | success | info)
- UiCard (elevated?: boolean)
- UiInput (type, label, error, hint)
- UiModal (title, open, onClose)
- UiSkeleton (for loading states — takes width and height)
- UiTooltip (content, placement)
- UiSpinner

---

## Domain components (components/audit/, components/board/)

These know about GhostAudit types. They receive typed props matching 
your interfaces in types/index.ts.
```typescript
// components/audit/PersonaCard.vue
interface Props {
  output: PersonaOutput  // from types/index.ts
  isExpanded?: boolean
}
```

---

## Loading and empty states

Every component that fetches data must handle three states:
loading, empty, and populated. Never assume data exists.
```vue
<template>
  <UiSkeleton v-if="isLoading" class="h-48 w-full" />
  
  <div v-else-if="!issues.length" class="text-center py-12 text-gray-500">
    No issues found
  </div>
  
  <IssueCard 
    v-else
    v-for="issue in issues" 
    :key="issue.id" 
    :issue="issue" 
  />
</template>
```

---

## Accessibility

Every interactive element must be keyboard navigable.
Every image must have a meaningful alt attribute (or alt="" if decorative).
Every icon-only button must have an aria-label.
Color alone must never be the only indicator of meaning — 
always pair color with a text label or icon.

Test with Tab key navigation before considering any component done.

---

## TypeScript patterns

Prefer type over interface for unions and mapped types.
Prefer interface for object shapes that may be extended.
```typescript
// Union type — use type
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Object shape — use interface
interface AuditScores {
  clarity: number
  trust: number
  conversion: number
  performance: number
  technical: number
}
```

Never cast with `as` unless you have genuinely verified the type is 
correct. Prefer type guards:
```typescript
// Good
function isAuditComplete(audit: Audit): audit is Audit & { overallScore: number } {
  return audit.status === AuditStatus.Complete && audit.overallScore !== null
}

// Bad — suppresses the type error without solving it
const score = (audit as any).overallScore
```

---

## Imports

Always use path aliases. Never use relative paths that go more than 
one level up.
```typescript
// Good
import type { Issue } from '~/types'
import { useApi } from '~/composables/useApi'
import UiButton from '~/components/ui/UiButton.vue'

// Bad
import { useApi } from '../../composables/useApi'
```

Group imports: Vue/Nuxt built-ins → third-party → app imports (types 
last).

Remove all unused imports before committing.

---

## What to never do

- Never use Options API (`export default { data() { ... } }`)
- Never mutate props directly — emit an event and let the parent update
- Never use v-html unless the content is sanitised and you own it
- Never store sensitive data (tokens) in sessionStorage in production
  — use httpOnly cookies or handle via the API when possible (V2 task)
- Never use `document.querySelector` or `getElementById` — 
  use template refs (`ref=""`) instead
- Never use `window.*` directly — wrap in `onMounted` or use VueUse
- Never use `setTimeout` for UX timing hacks — use CSS transitions
- Never leave TODO comments in committed code unless they have a 
  ticket reference: `// TODO: GA-123 — add animation once Raul's 
  WebSocket events are wired`