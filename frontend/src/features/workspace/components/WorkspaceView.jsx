import { useCallback, useState } from 'react';
import { WorkspaceToolbar } from './WorkspaceToolbar';
import { CanvasElement } from './CanvasElement';

/**
 * @component WorkspaceView
 * @description Main workspace canvas view. Manages element rendering,
 * selection, and toolbar interactions. Follows IDE aesthetic.
 *
 * COLOR CONTRACT:
 * Consumes --color-brand-500 for selection highlights, --color-border for borders.
 * Canvas background uses --color-surface-alt.
 *
 * @param {{
 *   elements: Object[],
 *   selectedId: string | null,
 *   loading: boolean,
 *   error: string | null,
 *   onAddElement: Function,
 *   onUpdateElement: Function,
 *   onDeleteElement: Function,
 *   onSelectElement: Function,
 *   onClearSelection: Function,
 *   onBringToFront: Function,
 *   onSave: Function,
 * }} props
 *
 * @returns {JSX.Element}
 *
 * @example
 * <WorkspaceView
 *   elements={elements}
 *   selectedId={selectedId}
 *   loading={loading}
 *   error={error}
 *   onAddElement={addElement}
 *   onUpdateElement={updateElement}
 *   onDeleteElement={deleteElement}
 *   onSelectElement={selectElement}
 *   onClearSelection={clearSelection}
 *   onBringToFront={bringToFront}
 *   onSave={handleSave}
 * />
 */
export function WorkspaceView({
  elements,
  selectedId,
  loading,
  error,
  is404 = false,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onSelectElement,
  onClearSelection,
  onBringToFront,
  onSave
}) {
  const [saving, setSaving] = useState(false);

  const handleCanvasClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClearSelection();
    }
  }, [onClearSelection]);

  const handleAddElement = useCallback((type) => {
    onAddElement(type);
  }, [onAddElement]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedId) {
      onDeleteElement(selectedId);
    }
  }, [selectedId, onDeleteElement]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  }, [onSave]);

  if (loading) {
    return (
      <div className="workspace-shell">
        <div className="workspace-toolbar-placeholder">
          <div className="placeholder-glow">
            <span className="placeholder col-3 rounded" style={{ height: '36px' }} />
            <span className="placeholder col-2 rounded" style={{ height: '36px', marginLeft: '8px' }} />
          </div>
        </div>
        <div className="workspace-canvas workspace-canvas--loading">
          <div className="workspace-loading-inner">
            <span className="placeholder col-4 rounded" style={{ height: '120px' }} />
            <span className="placeholder col-3 rounded" style={{ height: '80px', marginTop: '40px', marginLeft: '60px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (is404) {
    return (
      <div className="workspace-shell">
        <div className="workspace-toolbar-placeholder">
          <div className="workspace-toolbar-group">
            <button
              className="workspace-tool-btn workspace-tool-btn--primary"
              onClick={() => onAddElement('sticky')}
              type="button"
            >
              <span className="workspace-tool-icon">+</span>
              <span className="workspace-tool-label">New Sticky</span>
            </button>
          </div>
        </div>
        <div className="workspace-canvas">
          <div className="workspace-empty" style={{ pointerEvents: 'none' }}>
            <div className="workspace-empty-icon" aria-hidden="true">◇</div>
            <p className="workspace-empty-text">
              No workspace yet.<br />
              Create your first diagram using the toolbar above.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workspace-shell">
        <div className="workspace-toolbar-placeholder" />
        <div className="workspace-canvas">
          <div className="workspace-error">
            <div className="workspace-error-icon" aria-hidden="true">⚠</div>
            <h3 className="workspace-error-title">Failed to load workspace</h3>
            <p className="workspace-error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-shell">
      <WorkspaceToolbar
        onAddElement={handleAddElement}
        onDeleteSelected={handleDeleteSelected}
        onSave={handleSave}
        hasSelection={!!selectedId}
        saving={saving}
      />

      <div
        className="workspace-canvas"
        onClick={handleCanvasClick}
        role="application"
        aria-label="Workspace canvas - click to deselect"
      >
        {elements.length === 0 ? (
          <div className="workspace-empty">
            <div className="workspace-empty-icon" aria-hidden="true">◇</div>
            <p className="workspace-empty-text">
              Your workspace is empty.
              <br />
              Use the toolbar above to add elements.
            </p>
          </div>
        ) : (
          elements.map(element => (
            <CanvasElement
              key={element.id}
              element={element}
              isSelected={selectedId === element.id}
              onSelect={() => onSelectElement(element.id)}
              onUpdate={(updates) => onUpdateElement(element.id, updates)}
              onDelete={() => onDeleteElement(element.id)}
              onBringToFront={() => onBringToFront(element.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}