import { useRef } from 'react';

/**
 * @component WorkspaceToolbar
 * @description Toolbar for adding new elements to the workspace canvas.
 * Follows IDE aesthetic: minimal, high-contrast, 1px borders.
 *
 * COLOR CONTRACT:
 * Consumes --color-brand-500 for active states, --color-border for separators.
 * No entity colors needed.
 *
 * @param {{
 *   onAddElement: Function,
 *   onDeleteSelected: Function,
 *   onSave: Function,
 *   hasSelection: boolean,
 *   saving: boolean,
 * }} props
 *
 * @returns {JSX.Element}
 *
 * @example
 * <WorkspaceToolbar
 *   onAddElement={(type) => addElement(type)}
 *   onDeleteSelected={() => deleteElement(selectedId)}
 *   hasSelection={!!selectedId}
 * />
 */
export function WorkspaceToolbar({
  onAddElement,
  onDeleteSelected,
  onSave,
  hasSelection,
  saving
}) {
  const fileInputRef = useRef(null);

  const tools = [
    { id: 'sticky', label: 'Sticky Note', icon: '▢', title: 'Add sticky note' },
    { id: 'shape', label: 'Shape', icon: '◯', title: 'Add shape' },
    { id: 'text', label: 'Text', icon: 'T', title: 'Add text block' }
  ];

  return (
    <div
      className="workspace-toolbar"
      role="toolbar"
      aria-label="Workspace tools"
    >
      <div className="workspace-toolbar-group">
        {tools.map(tool => (
          <button
            key={tool.id}
            className="workspace-tool-btn"
            onClick={() => onAddElement(tool.id)}
            title={tool.title}
            aria-label={tool.title}
            type="button"
          >
            <span className="workspace-tool-icon" aria-hidden="true">
              {tool.icon}
            </span>
            <span className="workspace-tool-label">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="workspace-toolbar-sep" role="separator" />

      <div className="workspace-toolbar-group">
        <button
          className="workspace-tool-btn workspace-tool-btn--danger"
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          title="Delete selected element"
          aria-label="Delete selected element"
          type="button"
        >
          <span className="workspace-tool-icon" aria-hidden="true">✕</span>
          <span className="workspace-tool-label">Delete</span>
        </button>
      </div>

      <div className="workspace-toolbar-spacer" />

      <div className="workspace-toolbar-group">
        <button
          className="workspace-tool-btn workspace-tool-btn--primary"
          onClick={onSave}
          disabled={saving}
          title="Save workspace"
          aria-label="Save workspace"
          type="button"
        >
          <span className="workspace-tool-icon" aria-hidden="true">
            {saving ? '⟳' : '✓'}
          </span>
          <span className="workspace-tool-label">
            {saving ? 'Saving...' : 'Save'}
          </span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="workspace-hidden-input"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}