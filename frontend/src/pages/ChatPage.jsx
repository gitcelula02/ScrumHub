import { useParams } from 'react-router-dom';
import { ChatLayout } from '@/features/chat/components/ChatLayout';

/**
 * @page ChatPage
 * @route /projects/:projectId/chat
 * @description Project chat page — full-width chat layout.
 * No real-time WebSocket connection in this version. See ENDPOINTS.md.
 */
export default function ChatPage() {
  const { projectId } = useParams();

  return (
    <div style={{ height: '100%', overflow: 'hidden', margin: '-1.5rem' }}>
      <ChatLayout projectName={`Project ${projectId || ''}`} />
    </div>
  );
}
