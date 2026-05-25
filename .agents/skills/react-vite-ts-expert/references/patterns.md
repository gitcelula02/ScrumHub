# Advanced React Patterns

## Compound Components

Use when a component family shares implicit state (e.g., Tabs, Accordion, Select).

```tsx
// components/ui/Tabs/index.tsx
import { createContext, useContext, useState } from 'react'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('useTabs must be used within <Tabs>')
  return ctx
}

interface TabsProps {
  defaultTab: string
  children: React.ReactNode
}

export function Tabs({ defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

Tabs.List = function TabsList({ children }: { children: React.ReactNode }) {
  return <div role="tablist" className="tabs-list">{children}</div>
}

interface TabTriggerProps {
  value: string
  children: React.ReactNode
}

Tabs.Trigger = function TabTrigger({ value, children }: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabs()
  return (
    <button
      role="tab"
      aria-selected={activeTab === value}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

interface TabPanelProps {
  value: string
  children: React.ReactNode
}

Tabs.Panel = function TabPanel({ value, children }: TabPanelProps) {
  const { activeTab } = useTabs()
  return activeTab === value ? <div role="tabpanel">{children}</div> : null
}
```

Usage:
```tsx
<Tabs defaultTab="profile">
  <Tabs.List>
    <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="profile"><ProfilePanel /></Tabs.Panel>
  <Tabs.Panel value="settings"><SettingsPanel /></Tabs.Panel>
</Tabs>
```

---

## Render Props (for logic reuse without hooks)

Prefer hooks over render props. Use render props only when the consumer needs full rendering control.

```tsx
interface RenderProps<T> {
  data: T
  isLoading: boolean
  error: Error | null
}

interface DataFetcherProps<T> {
  fetcher: () => Promise<T>
  children: (props: RenderProps<T | null>) => React.ReactNode
}
```

---

## HOC Pattern (use sparingly — prefer hooks)

```tsx
function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent: React.ComponentType<{ error: Error }>
) {
  return function WrappedWithErrorBoundary(props: P) {
    return (
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
```

---

## Polymorphic Components

For `as` prop pattern (e.g., `<Button as="a" href="...">`):

```tsx
type AsProp<C extends React.ElementType> = { as?: C }
type PropsWithAs<C extends React.ElementType, P = {}> = AsProp<C> &
  Omit<React.ComponentPropsWithRef<C>, keyof AsProp<C>> & P

type ButtonProps<C extends React.ElementType = 'button'> = PropsWithAs<C, {
  variant?: 'primary' | 'ghost'
}>

export function Button<C extends React.ElementType = 'button'>({
  as,
  variant = 'primary',
  children,
  ...rest
}: ButtonProps<C>) {
  const Component = as ?? 'button'
  return <Component className={`btn btn-${variant}`} {...rest}>{children}</Component>
}
```

---

## Error Boundaries

React doesn't have a built-in hook for error boundaries — use a class component or `react-error-boundary`:

```tsx
import { ErrorBoundary } from 'react-error-boundary'

function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

// Wrap route-level or feature-level:
<ErrorBoundary FallbackComponent={GlobalErrorFallback}>
  <SomeFeature />
</ErrorBoundary>
```

---

## Suspense + Lazy Loading

```tsx
// routes/index.tsx
import { lazy, Suspense } from 'react'

const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'))

// In router:
{
  path: 'users/:userId',
  element: (
    <Suspense fallback={<PageSkeleton />}>
      <UserProfilePage />
    </Suspense>
  )
}
```

---

## Context: when to use vs Zustand

| Use case | Tool |
|---|---|
| Theming / locale / auth user (rarely changes, read-only) | React Context |
| UI state shared across many components (modals, sidebar) | Zustand |
| Server data | TanStack Query |
| Local component state | `useState` / `useReducer` |
| Derived state | `useMemo` |