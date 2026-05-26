# Chatbot Re-implementation Plan

## Context

- **Commit**: `ffca1b52c80bd61d03b159a60bee0e895745d8f4` (merge commit that removed legacy `frontend/public/js/` files)
- **Legacy File**: `frontend/public/js/ai.js` - Vanilla JS `AIChat` class with full chatbot UI logic
- **Backend**: Express API at `/api/ai/chat` (POST), `/api/ai/history` (GET) - fully functional
- **Current Frontend**: TanStack Start + React + Vite + TypeScript with shadcn/ui components

## Current State

| Location | Status |
|----------|--------|
| `frontend/src/features/chat/index.ts` | Empty barrel export |
| `frontend/src/pages/ChatPage.tsx` | Stub - just shows text |
| `frontend/src/pages/ChatSessionPage.tsx` | Stub - just shows text |
| `frontend/src/routes/app/projects/$projectId/chat/` | Route exists |
| `frontend/src/routes/app/projects/$projectId/chat/$sessionId` | Route exists |

## Backend API Contract

### POST `/api/ai/chat`
```json
// Request
{ "message": "string", "projectId": "string|null" }

// Response
{
  "success": true,
  "result": {
    "type": "task_created|project_created|task_updated|help|search_results|error|awaiting_task_id",
    "message": "string",
    "task": { ... } | undefined,
    "project": { ... } | undefined
  }
}
```

### GET `/api/ai/history?projectId=X`
```json
// Response
{
  "success": true,
  "history": [
    { "role": "user|ai", "text": "string", "type": "string", "timestamp": "Date", "metadata": {} }
  ]
}
```

---

## Implementation Steps

### Step 1: Create.chat Service Layer
**File**: `frontend/src/features/chat/services/chatService.ts`

- `sendMessage(message: string, projectId?: string)` → POST `/api/ai/chat`
- `getHistory(projectId?: string)` → GET `/api/ai/history`
- Uses existing `apiClient` from `@/services/apiClient`

### Step 2: Create Chat Hooks
**File**: `frontend/src/features/chat/hooks/useChat.ts`

- `useChatMessages(projectId?: string)` - TanStack Query hook for loading history
- `useSendMessage()` - Mutation hook for sending messages
- Manages message state: `{ id, role: 'user'|'ai', text, type, timestamp }`

### Step 3: Create Chat UI Components
**Files**: `frontend/src/features/chat/components/`

#### `ChatContainer.tsx`
- Main wrapper component
- Receives `projectId` prop
- Manages: messages array, input value, loading state, pending action state

#### `ChatMessageList.tsx`
- Scrollable message list
- Renders `ChatMessage` for each message
- Auto-scrolls to bottom on new message
- Uses shadcn `ScrollArea` component

#### `ChatMessage.tsx`
- Single message bubble
- Props: `message: { role, text, type, task?, project? }`
- User messages: right-aligned, distinct styling
- AI messages: left-aligned, with avatar
- Task/Project preview cards for actionable responses

#### `ChatInput.tsx`
- Text input with send button
- Enter key submits (Shift+Enter for newline)
- Loading spinner while awaiting response

### Step 4: Create Session Management (Optional/Future)
**File**: `frontend/src/features/chat/hooks/useChatSession.ts`

- UUID generation for session IDs
- Session persistence in localStorage
- List active sessions

### Step 5: Update Pages
**Files**: 
- `frontend/src/pages/ChatPage.tsx` → Renders `ChatContainer` with project context
- `frontend/src/pages/ChatSessionPage.tsx` → Renders session-aware `ChatContainer`

### Step 6: Add Type Definitions
**File**: `frontend/src/features/chat/types/chatTypes.ts`

```typescript
interface ChatMessage {
  id?: string;
  role: 'user' | 'ai';
  text: string;
  type: string;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
  task?: Task;
  project?: Project;
}

interface AIResponse {
  type: string;
  message: string;
  task?: Task;
  project?: Project;
  assignee?: string;
  assigneeName?: string;
}
```

### Step 7: Update Feature Barrel Export
**File**: `frontend/src/features/chat/index.ts`

Export all public components, hooks, and types.

---

## Visual Design Notes

- Follow existing theme variables: `bg-sidebar-bg`, `border-panel-border`, `text-foreground`, etc.
- Use shadcn `Button`, `Input`, `ScrollArea`, `Card` components
- Chat panel width: ~420px similar to `AINotifications.tsx`
- Message bubbles: `rounded-lg`, user = primary tint, ai = muted

## Testing Checklist

- [ ] Send message "crear tarea Test" → verify task created in backend
- [ ] Send message "crear proyecto MiApp" → verify project created
- [ ] History persists across page refreshes
- [ ] Loading states display correctly
- [ ] Error messages show on API failure
- [ ] Auto-scroll works on new messages
- [ ] Task preview cards are clickable (navigate to task)

## Dependencies

- `@tanstack/react-query` (already in use)
- shadcn/ui components: `ScrollArea`, `Card`, `Button`, `Input`, `Avatar`
- `lucide-react` icons (already in use)
- Existing `apiClient`, `useAuth` context
