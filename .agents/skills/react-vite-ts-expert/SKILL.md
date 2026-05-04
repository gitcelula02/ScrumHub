---
name: react-vite-ts-expert
description: >
  Expert React + Vite + TypeScript frontend developer skill. Use this skill whenever the user wants to
  build, scaffold, extend, or review a React frontend project using Vite and TypeScript. Triggers include:
  any mention of React + Vite, React + TypeScript, building a frontend app, creating React components,
  setting up a frontend project structure, writing hooks, creating pages or routes, managing state with
  Zustand, React Query, Redux Toolkit, working with services/API layers, or designing folder/feature
  structures. Also triggers when user asks for help with dumb/presentational components, smart containers,
  custom hooks, or best practices for React architecture. Always use this skill even if the user just
  mentions "frontend app", "React project", "TypeScript component", or "Vite project" — do not rely on
  generic knowledge for React architecture; consult this skill first.
---

# React + Vite + TypeScript Expert

This skill produces production-grade, scalable React + Vite + TypeScript frontends using modern best
practices: modularization, separation of concerns, dumb/presentational components, typed APIs, and
feature-based architecture.

> **Before writing any code**, read this SKILL.md fully. For complex features, also read the relevant
> reference files under `references/`.

---

## Core Principles

1. **Separation of Concerns**: UI rendering is separate from logic, state, and data-fetching.
2. **Dumb Components**: Presentational components receive only props — no hooks, no store access, no side effects.
3. **Smart Containers / Hooks**: All logic, state, and data lives in hooks or container components.
4. **TypeScript Strictness**: All files use `.tsx` / `.ts`. No `any`. Prefer `unknown` + type guards. Enable strict mode.
5. **Modern React only**: Use React 18+ APIs. No class components. No deprecated APIs (see list below).
6. **Colocation**: Code lives near what it belongs to — feature-specific code stays inside the feature folder.

---

## Forbidden / Deprecated Patterns

Never use the following — always replace with the modern equivalent:

| Deprecated | Modern Replacement |
|---|---|
| `React.FC` / `React.FunctionComponent` | Plain function with typed props: `function Foo(props: FooProps)` |
| `React.ElementRef<T>` | `React.ComponentRef<T>` (React 19+) or `HTMLDivElement` directly |
| `React.VFC` | Same as above — just use typed function |
| `defaultProps` on function components | Default parameter values in function signature |
| `propTypes` | TypeScript interface / type |
| `React.createRef()` in function components | `useRef<T>(null)` |
| `React.MouseEvent` (imported from 'react' as namespace) | Import named: `import type { MouseEvent } from 'react'` |
| `componentDidMount`, `componentWillUnmount` | `useEffect` |
| `forwardRef` (React 19+) | Pass `ref` as a regular prop with `React.Ref<T>` type |
| String refs | `useRef` |
| `useLayoutEffect` (SSR) | `useIsomorphicLayoutEffect` from custom hook |
| Inline anonymous functions as event handlers in hot paths | Named handlers defined inside component |
| Index as `key` in dynamic lists | Stable unique IDs |

---

## Project Bootstrap

### Stack

- **Bundler**: Vite 5+
- **Framework**: React 18+ (or 19 if specified)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v3+ (default) or CSS Modules (if specified)
- **State**: Zustand (local/global UI state), TanStack Query v5 (server state)
- **Routing**: React Router v6+ (or TanStack Router if specified)
- **Forms**: React Hook Form + Zod
- **Linting**: ESLint + `eslint-plugin-react-hooks` + `@typescript-eslint`
- **Formatting**: Prettier

### `vite.config.ts` essentials

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

### `tsconfig.json` essentials

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

---

## Folder Structure

```
src/
├── components/
│   ├── layout/        # App shell: Header, Sidebar, Footer, PageWrapper
│   └── ui/            # Generic dumb UI primitives: Button, Input, Modal, Card, Badge
├── features/          # Feature modules (see below)
├── hooks/             # Global reusable custom hooks
├── lib/               # Third-party wrappers, clients, singletons (e.g., axios instance, queryClient)
├── pages/             # Route-level page components (thin wrappers, delegate to features)
├── routes/            # Route definitions (React Router or TanStack Router config)
├── services/          # Global API service functions (not feature-specific)
├── store/             # Global Zustand stores (not feature-specific)
├── utils/             # Pure utility functions (formatters, validators, helpers)
└── types/             # Global shared TypeScript types and interfaces
```

### Feature Module Structure

Each feature is a vertical slice — self-contained with its own components, hooks, services, store, and utils.

```
features/
└── user-profile/
    ├── components/    # Dumb components specific to this feature
    ├── hooks/         # Custom hooks for this feature
    ├── services/      # API calls for this feature
    ├── store/         # Zustand slice for this feature
    ├── utils/         # Utility functions for this feature
    ├── lib/           # Feature-specific third-party config
    ├── types.ts       # Feature-specific TypeScript types
    └── index.ts       # Public API — only export what other features need
```

**Rule**: Features must never import from each other's internals. Only import from `features/other-feature/index.ts`.

---

## Component Patterns

### Dumb / Presentational Component

```tsx
// components/ui/Avatar.tsx
interface AvatarProps {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const sizeClass = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' }[size]
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover ${sizeClass} ${className ?? ''}`}
    />
  )
}
```

Rules:
- No `useState`, `useEffect`, or store access
- All data comes from props
- Can use `useMemo` / `useCallback` only for derived/stable values
- Can accept `children`, `className`, event handlers as props

### Smart Container (Hook-driven)

```tsx
// features/user-profile/components/UserProfileCard.tsx
import { useUserProfile } from '../hooks/useUserProfile'
import { UserProfileView } from './UserProfileView' // dumb

interface UserProfileCardProps {
  userId: string
}

export function UserProfileCard({ userId }: UserProfileCardProps) {
  const { user, isLoading, error } = useUserProfile(userId)

  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage message={error.message} />
  if (!user) return null

  return <UserProfileView user={user} />
}
```

### Refs — correct typing

```tsx
// ✅ Correct
const inputRef = useRef<HTMLInputElement>(null)

// ✅ React 19+: ref as prop
interface InputProps {
  ref?: React.Ref<HTMLInputElement>
}

// ❌ Never
const ref = React.createRef()
const ref2 = React.ElementRef<typeof SomeComponent> // use React.ComponentRef instead
```

---

## Hooks

### Custom Hook Pattern

```ts
// hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
```

Rules:
- Name starts with `use`
- Single responsibility
- Return typed object `{ data, isLoading, error }` (not positional arrays, unless mimicking `useState`)
- Never export side effects directly — encapsulate in hook

---

## Services

API service functions are plain async functions — no class instances, no singletons in service files.

```ts
// features/user-profile/services/userService.ts
import { apiClient } from '@/lib/apiClient'
import type { User } from '../types'

export async function fetchUserById(userId: string): Promise<User> {
  const { data } = await apiClient.get<User>(`/users/${userId}`)
  return data
}
```

The shared Axios/Fetch instance lives in `lib/`:

```ts
// lib/apiClient.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})
```

---

## Store (Zustand)

```ts
// features/user-profile/store/userProfileStore.ts
import { create } from 'zustand'

interface UserProfileState {
  selectedUserId: string | null
  setSelectedUserId: (id: string | null) => void
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id }),
}))
```

Rules:
- One store per feature (or domain)
- Store holds **UI state** only — server data lives in TanStack Query cache
- Use `immer` middleware for complex nested state
- Never call store inside dumb components

---

## Routing

```ts
// routes/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { UserProfilePage } from '@/pages/UserProfilePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'users/:userId', element: <UserProfilePage /> },
    ],
  },
])
```

Pages are thin — they extract route params and pass to feature containers:

```tsx
// pages/UserProfilePage.tsx
import { useParams } from 'react-router-dom'
import { UserProfileCard } from '@/features/user-profile/components/UserProfileCard'

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  if (!userId) return <Navigate to="/" />
  return <UserProfileCard userId={userId} />
}
```

---

## TypeScript Rules

- No `any` — use `unknown` + type narrowing or generics
- Use `interface` for object shapes that may be extended; `type` for unions/intersections
- Export types explicitly: `export type { User }`
- Use `satisfies` operator for config objects
- Prefer `readonly` arrays: `readonly string[]`
- Use discriminated unions for state machines:

```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
```

---

## Forms (React Hook Form + Zod)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({ onSubmit }: { onSubmit: (values: LoginFormValues) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Login</button>
    </form>
  )
}
```

---

## What to generate when asked for a full project

When asked to scaffold a full app or feature, always produce (in order):

1. **Folder structure** — show the full tree first
2. **Types** — define all data shapes in `types.ts`
3. **Services** — API calls
4. **Store** — Zustand slice (if UI state needed)
5. **Hooks** — data-fetching hooks using TanStack Query
6. **Dumb components** — pure presentational
7. **Smart containers** — compose hooks + dumb components
8. **Page** — thin route-level component
9. **Route registration** — add to router

> For deep dives on each layer, see `references/`:
> - `references/patterns.md` — advanced patterns (render props, compound components, HOCs)
> - `references/tanstack-query.md` — TanStack Query v5 patterns
> - `references/zustand.md` — Zustand advanced patterns
> - `references/testing.md` — Vitest + Testing Library conventions