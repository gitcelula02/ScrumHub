# TanStack Query v5 Patterns

## Setup

```tsx
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
})

// main.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

---

## Query Keys — typed factory pattern

```ts
// features/user-profile/lib/queryKeys.ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}
```

---

## useQuery hook

```ts
// features/user-profile/hooks/useUserProfile.ts
import { useQuery } from '@tanstack/react-query'
import { fetchUserById } from '../services/userService'
import { userKeys } from '../lib/queryKeys'
import type { User } from '../types'

export function useUserProfile(userId: string) {
  return useQuery<User, Error>({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUserById(userId),
    enabled: Boolean(userId),
  })
}
```

---

## useMutation hook

```ts
// features/user-profile/hooks/useUpdateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser } from '../services/userService'
import { userKeys } from '../lib/queryKeys'

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<User>) => updateUser(userId, payload),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.detail(userId), updatedUser)
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
```

---

## Infinite Query

```ts
export function useUserList() {
  return useInfiniteQuery({
    queryKey: userKeys.lists(),
    queryFn: ({ pageParam }) => fetchUsers({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  })
}
```

---

## Optimistic Updates

```ts
useMutation({
  mutationFn: toggleLike,
  onMutate: async (postId) => {
    await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) })
    const previous = queryClient.getQueryData(postKeys.detail(postId))
    queryClient.setQueryData(postKeys.detail(postId), (old: Post) => ({
      ...old,
      liked: !old.liked,
    }))
    return { previous }
  },
  onError: (_err, postId, context) => {
    queryClient.setQueryData(postKeys.detail(postId), context?.previous)
  },
})
```

---

## Prefetching

```ts
// In route loaders or on hover:
await queryClient.prefetchQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => fetchUserById(userId),
})
```