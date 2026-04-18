import { useState } from 'react';

/**
 * @component ChatLayout
 * @description Full-width project chat layout with toggle sidebar for online members.
 *
 * Layout:
 * - Full-height chat area with message history
 * - Sticky header with channel name, online count toggle, and close button
 * - Toggle sidebar slides in from right showing online/offline members
 * - Message input at bottom
 *
 * @param {Object} props
 * @param {string} [props.projectName] - Project name for the chat header
 */
export function ChatLayout({ projectName = 'Project' }) {
  const [membersOpen, setMembersOpen] = useState(false);

  const MOCK_MEMBERS = [
    { id: '1', name: 'Alice Chen', role: 'Scrum Master', online: true },
    { id: '2', name: 'Bob Martínez', role: 'Developer', online: true },
    { id: '3', name: 'Carol Osei', role: 'Product Owner', online: false },
    { id: '4', name: 'David Kim', role: 'Developer', online: true },
  ];

  const MOCK_MESSAGES = [
    { id: '1', author: 'Alice Chen', time: '09:14', text: 'Good morning team! Sprint planning in 30 min 🚀', online: true },
    { id: '2', author: 'Bob Martínez', time: '09:16', text: "On it. I'll finish the auth ticket before the meeting.", online: true },
    { id: '3', author: 'Carol Osei', time: '09:18', text: 'Backlog is updated with 3 new user stories from the stakeholder call.', online: false },
    { id: '4', author: 'ScrumHub AI', time: '09:20', text: '📋 Sprint 4 is 78% complete. 2 tasks are blocked — "API rate limiting" and "Image upload". Would you like me to create a blockers report?', isAI: true },
    { id: '5', author: 'David Kim', time: '09:21', text: 'Yes please @AI!', online: true },
  ];

  const onlineCount = MOCK_MEMBERS.filter(m => m.online).length;

  const toggleMembers = () => setMembersOpen(o => !o);

  return (
    <div className="chat-full-shell animate-in" aria-label="Project chat">
      {/* Main chat area */}
      <div className="chat-full-main">
        {/* Chat header */}
        <header className="chat-full-header" aria-label="Chat header">
          <div className="chat-full-header-left">
            <span className="chat-channel-icon fw-medium me-1" aria-hidden="true">#</span>
            <span className="fw-medium">{projectName}</span>
            <span className="text-secondary mx-2">|</span>
            <span className="text-sm text-secondary">general</span>
          </div>
          <div className="chat-full-header-right">
            <button
              className="chat-full-members-toggle"
              onClick={toggleMembers}
              title={`${onlineCount} members online — click to view`}
              aria-label={`${onlineCount} members online — click to view`}
              aria-expanded={membersOpen}
            >
              <span className="chat-online-indicator" aria-hidden="true" />
              Online {onlineCount}
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div className="chat-full-messages" role="log" aria-label="Chat messages" aria-live="polite">
          {MOCK_MESSAGES.map(msg => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}
          <div id="chat-scroll-bottom" aria-hidden="true" />
        </div>

        {/* Input bar */}
        <div className="chat-full-input-bar" role="form" aria-label="Message input">
          <div className="chat-input-wrap">
            <button
              className="chat-input-attach"
              title="Attach a file"
              aria-label="Attach file"
            >
              +
            </button>
            <input
              id="chat-message-input"
              type="text"
              className="chat-input"
              placeholder="Message — type @AI to involve the assistant"
              aria-label="Type a message. Use @AI to involve the AI assistant."
              title="Message input"
            />
            <button
              className="chat-input-ai-btn"
              title="Mention the AI assistant"
              aria-label="Mention AI"
            >
              ✦
            </button>
          </div>
        </div>
      </div>

      {/* Members sidebar - slides in from right */}
      <aside
        className={`chat-full-members ${membersOpen ? 'chat-full-members--open' : ''}`}
        aria-label="Team members"
        title="Team members"
        aria-hidden={!membersOpen}
      >
        <div className="chat-full-members-header">
          <span className="fw-medium text-sm">Team Members</span>
          <button
            className="chat-full-members-close"
            onClick={() => setMembersOpen(false)}
            title="Close members panel"
            aria-label="Close members panel"
          >
            ✕
          </button>
        </div>

        <div className="chat-full-members-list">
          <div className="chat-full-members-section">
            <span className="chat-full-members-label">
              ONLINE — {onlineCount}
            </span>
            {MOCK_MEMBERS.filter(m => m.online).map(m => (
              <MemberRow key={m.id} member={m} />
            ))}
          </div>

          <div className="chat-full-members-section">
            <span className="chat-full-members-label">
              OFFLINE — {MOCK_MEMBERS.filter(m => !m.online).length}
            </span>
            {MOCK_MEMBERS.filter(m => !m.online).map(m => (
              <MemberRow key={m.id} member={m} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ── ChatMessage ────────────────────────────────────── */
function ChatMessage({ msg }) {
  return (
    <div
      className={`chat-message ${msg.isAI ? 'chat-message--ai' : ''}`}
      role="article"
      aria-label={`Message from ${msg.author}`}
      title={`${msg.author} at ${msg.time}`}
    >
      <div
        className="chat-msg-avatar"
        aria-hidden="true"
        style={{ background: msg.isAI ? 'var(--color-brand-500)' : undefined }}
      >
        {msg.isAI ? '✦' : msg.author[0]}
      </div>
      <div className="chat-msg-body">
        <div className="d-flex align-items-baseline gap-2">
          <span className={`chat-msg-author ${msg.isAI ? 'text-brand' : ''}`} title={msg.author}>
            {msg.author}
          </span>
          <span className="chat-msg-time text-xs text-secondary" title={`Sent at ${msg.time}`}>{msg.time}</span>
          {msg.isAI && (
            <span className="badge text-bg-primary" style={{ fontSize: '0.65rem' }} title="AI generated message" aria-label="AI">
              AI
            </span>
          )}
        </div>
        <p className="chat-msg-text text-sm mb-0">{msg.text}</p>
      </div>
    </div>
  );
}

/* ── MemberRow ──────────────────────────────────────── */
function MemberRow({ member }) {
  return (
    <div
      className="chat-member-row"
      title={`${member.name} — ${member.role} — ${member.online ? 'Online' : 'Offline'}`}
      aria-label={`${member.name}, ${member.role}`}
    >
      <div className="chat-dm-avatar" aria-hidden="true">
        {member.name[0]}
        <span className={`chat-online-dot ${member.online ? 'online' : 'offline'}`} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs fw-medium mb-0 truncate" title={member.name}>{member.name}</p>
        <p className="text-xs text-secondary mb-0 truncate" title={member.role}>{member.role}</p>
      </div>
    </div>
  );
}