# Zustand Advanced Patterns

## Basic Store

```ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
```

---

## With Immer (complex nested state)

```ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
}

export const useCartStore = create<CartState>()(
  immer((set) => ({
    items: [],
    addItem: (item) =>
      set((state) => {
        const existing = state.items.find((i) => i.id === item.id)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          state.items.push(item)
        }
      }),
    removeItem: (id) =>
      set((state) => {
        state.items = state.items.filter((i) => i.id !== id)
      }),
    updateQuantity: (id, qty) =>
      set((state) => {
        const item = state.items.find((i) => i.id === id)
        if (item) item.quantity = qty
      }),
  }))
)
```

---

## With devtools + persist

```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light' as 'light' | 'dark',
        setTheme: (theme) => set({ theme }),
      }),
      { name: 'settings-storage' }
    ),
    { name: 'SettingsStore' }
  )
)
```

---

## Selectors — avoid re-renders

```tsx
// ✅ Selector — only re-renders when sidebarOpen changes
const sidebarOpen = useUIStore((state) => state.sidebarOpen)

// ❌ This re-renders on ANY store change
const { sidebarOpen } = useUIStore()
```

For multiple values, use `useShallow`:

```tsx
import { useShallow } from 'zustand/react/shallow'

const { sidebarOpen, theme } = useUIStore(
  useShallow((state) => ({ sidebarOpen: state.sidebarOpen, theme: state.theme }))
)
```

---

## Slice Pattern (for large global stores)

```ts
// store/slices/notificationSlice.ts
export interface NotificationSlice {
  notifications: Notification[]
  addNotification: (n: Notification) => void
  removeNotification: (id: string) => void
}

export const createNotificationSlice = (set: any): NotificationSlice => ({
  notifications: [],
  addNotification: (n) => set((state: any) => ({ notifications: [...state.notifications, n] })),
  removeNotification: (id) =>
    set((state: any) => ({ notifications: state.notifications.filter((n: any) => n.id !== id) })),
})

// store/rootStore.ts
export const useRootStore = create<NotificationSlice & UISlice>()((...a) => ({
  ...createNotificationSlice(...a),
  ...createUISlice(...a),
}))
```

---

## Rule: Server State vs UI State

| Data | Store |
|---|---|
| Users, posts, products (from API) | TanStack Query |
| Sidebar open, modal visible, selected item ID | Zustand |
| Form values | React Hook Form |
| Derived/computed values | `useMemo` inside component or hook |