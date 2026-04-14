/**
 * @component ChatLayout
 * @description Unified project chat layout — styling and structure only.
 * No WebSocket or real-time utilities. UI mirrors Discord-style channel layout.
 *
 * Panels:
 *   Left  — channel / member list sidebar
 *   Center — message area + input bar
 *   Right — member roster (hidden on mobile)
 *
 * @param {Object} props
 * @param {string} [props.projectName] - Project name for the chat header
 */
export function ChatLayout({ projectName = 'Project' }) {
  const MOCK_CHANNELS = [
    { id: 'general',     label: 'general',      icon: '#' },
    { id: 'planning',    label: 'planning',      icon: '#' },
    { id: 'standups',    label: 'standups',      icon: '#' },
    { id: 'ai-context',  label: 'ai-context',    icon: '🤖' },
  ];

  const MOCK_MEMBERS = [
    { id: '1', name: 'Alice Chen',    role: 'Scrum Master',    online: true  },
    { id: '2', name: 'Bob Martínez',  role: 'Developer',       online: true  },
    { id: '3', name: 'Carol Osei',    role: 'Product Owner',   online: false },
    { id: '4', name: 'David Kim',     role: 'Developer',       online: true  },
  ];

  const MOCK_MESSAGES = [
    { id: '1', author: 'Alice Chen',   time: '09:14', text: 'Good morning team! Sprint planning in 30 min 🚀', online: true },
    { id: '2', author: 'Bob Martínez', time: '09:16', text: "On it. I'll finish the auth ticket before the meeting.", online: true },
    { id: '3', author: 'Carol Osei',   time: '09:18', text: 'Backlog is updated with 3 new user stories from the stakeholder call.', online: false },
    { id: '4', author: 'ScrumHub AI', time: '09:20', text: '📋 Sprint 4 is 78% complete. 2 tasks are blocked — "API rate limiting" and "Image upload". Would you like me to create a blockers report?', isAI: true },
    { id: '5', author: 'David Kim',    time: '09:21', text: 'Yes please @AI!', online: true },
  ];

  return (
    <div className="chat-shell animate-in" aria-label="Project chat" title={`${projectName} chat`}>
      {/* Left — channels */}
      <aside className="chat-channels" aria-label="Chat channels" title="Channel list">
        <div className="chat-channels-header" title={`${projectName} channels`}>
          <span className="fw-medium text-sm truncate">{projectName}</span>
        </div>
        <nav aria-label="Channels navigation">
          <div className="chat-channels-section-label" title="Text channels">Text Channels</div>
          {MOCK_CHANNELS.map(ch => (
            <button
              key={ch.id}
              className={`chat-channel-btn ${ch.id === 'general' ? 'active' : ''}`}
              title={`# ${ch.label} channel`}
              aria-label={`Channel: ${ch.label}`}
              aria-current={ch.id === 'general' ? 'page' : undefined}
            >
              <span className="chat-channel-icon" aria-hidden="true">{ch.icon}</span>
              {ch.label}
            </button>
          ))}
          <div className="chat-channels-section-label mt-3" title="Direct messages">Direct Messages</div>
          {MOCK_MEMBERS.slice(0, 3).map(m => (
            <button
              key={m.id}
              className="chat-channel-btn"
              title={`Direct message with ${m.name}`}
              aria-label={`Direct message: ${m.name}`}
            >
              <span
                className="chat-dm-avatar"
                title={m.online ? `${m.name} is online` : `${m.name} is offline`}
                aria-label={m.online ? 'Online' : 'Offline'}
              >
                {m.name[0]}
                <span className={`chat-online-dot ${m.online ? 'online' : 'offline'}`} aria-hidden="true" />
              </span>
              {m.name.split(' ')[0]}
            </button>
          ))}
        </nav>
      </aside>

      {/* Center — messages + input */}
      <div className="chat-main" aria-label="Message area">
        {/* Chat header */}
        <header className="chat-main-header" aria-label="Channel header" title="general channel">
          <span className="chat-channel-icon fw-medium me-1" aria-hidden="true">#</span>
          <span className="fw-medium text-sm">general</span>
          <span className="text-xs text-secondary ms-2" aria-label="Channel description">Team channel for general discussion</span>
        </header>

        {/* Messages */}
        <div className="chat-messages" role="log" aria-label="Chat messages" aria-live="polite">
          {MOCK_MESSAGES.map(msg => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}
          {/* Scroll anchor */}
          <div id="chat-scroll-bottom" aria-hidden="true" />
        </div>

        {/* Input bar */}
        <div className="chat-input-bar" role="form" aria-label="Message input">
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
              placeholder="Message #general  — type @AI to involve the assistant"
              aria-label="Type a message. Use @AI to involve the AI assistant."
              title="Message input"
            />
            <button
              className="chat-input-ai-btn"
              title="Mention the AI assistant"
              aria-label="Mention AI"
            >
              🤖
            </button>
          </div>
        </div>
      </div>

      {/* Right — members roster */}
      <aside className="chat-members" aria-label="Team members" title="Online members">
        <div className="chat-channels-section-label" title="Online members">
          ONLINE — {MOCK_MEMBERS.filter(m => m.online).length}
        </div>
        {MOCK_MEMBERS.filter(m => m.online).map(m => (
          <MemberRow key={m.id} member={m} />
        ))}
        <div className="chat-channels-section-label mt-3" title="Offline members">
          OFFLINE — {MOCK_MEMBERS.filter(m => !m.online).length}
        </div>
        {MOCK_MEMBERS.filter(m => !m.online).map(m => (
          <MemberRow key={m.id} member={m} />
        ))}
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
        {msg.isAI ? '🤖' : msg.author[0]}
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
