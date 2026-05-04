# Testing: Vitest + React Testing Library

## Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})

// src/test/setup.ts
import '@testing-library/jest-dom'
```

---

## Testing Dumb Components

```tsx
// components/ui/Avatar.test.tsx
import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('renders with correct alt text', () => {
    render(<Avatar src="/photo.jpg" alt="Jane Doe" />)
    expect(screen.getByAltText('Jane Doe')).toBeInTheDocument()
  })

  it('applies size class', () => {
    render(<Avatar src="/photo.jpg" alt="Jane" size="lg" />)
    expect(screen.getByAltText('Jane')).toHaveClass('h-14')
  })
})
```

---

## Testing Custom Hooks

```ts
// hooks/useDebounce.test.ts
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns debounced value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })
    expect(result.current).toBe('initial')

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('updated')
  })
})
```

---

## Testing with TanStack Query

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

it('shows user profile', async () => {
  server.use(http.get('/users/1', () => HttpResponse.json(mockUser)))

  render(<UserProfileCard userId="1" />, { wrapper: createWrapper() })
  expect(await screen.findByText(mockUser.name)).toBeInTheDocument()
})
```

---

## MSW for API Mocking

```ts
// src/test/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'Jane Doe' })
  }),
]

// src/test/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

// src/test/setup.ts
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## Testing Principles

- Test **behavior**, not implementation details
- Query by **role** and **accessible name** first (`getByRole`, `getByLabelText`)
- Never query by CSS class or component internals
- Prefer `findBy*` (async) over `waitFor` + `getBy*`
- One logical assertion per `it` block
- Keep tests co-located with source: `Button.test.tsx` next to `Button.tsx`