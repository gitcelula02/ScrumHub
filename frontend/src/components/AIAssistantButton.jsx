import { useState, useCallback } from 'react';

/**
 * @component AIAssistantButton
 * @description Fixed position AI assistant button visible on all views.
 * Located at bottom-left corner of the screen.
 * Opens a chat interface when clicked.
 *
 * @param {Function} [onClick] - Optional callback when button is clicked
 */
export function AIAssistantButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <button
      className="ai-assistant-btn"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Chat with AI Assistant"
      aria-label="Open AI Assistant"
    >
      <span className="ai-assistant-icon" aria-hidden="true">✦</span>
      {isHovered && <span className="ai-assistant-tooltip">AI Assistant</span>}
    </button>
  );
}