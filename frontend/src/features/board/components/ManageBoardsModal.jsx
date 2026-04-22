import { useState } from 'react';

const BOARD_COLORS = [
  '#6B5CFF', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316',
];

const DEFAULT_COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'var(--color-gray-400)', icon: '○' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--color-brand-500)', icon: '◑' },
  { id: 'in_review', label: 'In Review', color: 'var(--color-warning)', icon: '◐' },
  { id: 'done', label: 'Done', color: 'var(--color-success)', icon: '●' },
  { id: 'blocked', label: 'Blocked', color: 'var(--color-danger)', icon: '✕' },
];

/**
 * @component ManageBoardsModal
 * @description Modal for managing board columns - create, edit, delete boards.
 * Full-screen on mobile, large modal (80vw) on desktop.
 */
export function ManageBoardsModal({ boards = DEFAULT_COLUMNS, onClose, onCreateBoard, onUpdateBoard, onDeleteBoard }) {
  const [localBoards, setLocalBoards] = useState(boards);
  const [editingId, setEditingId] = useState(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardColor, setNewBoardColor] = useState(BOARD_COLORS[0]);

  const handleUpdateBoard = (boardId, updates) => {
    const updated = localBoards.map(b =>
      b.id === boardId ? { ...b, ...updates } : b
    );
    setLocalBoards(updated);
    onUpdateBoard?.(boardId, updates);
  };

  const handleDeleteBoard = (boardId) => {
    if (localBoards.length <= 1) {
      alert('Cannot delete the last board');
      return;
    }
    const updated = localBoards.filter(b => b.id !== boardId);
    setLocalBoards(updated);
    onDeleteBoard?.(boardId);
  };

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return;

    const newId = `board_${Date.now()}`;
    const newBoard = {
      id: newId,
      label: newBoardName.trim(),
      color: newBoardColor,
      icon: '○',
    };

    const updated = [...localBoards, newBoard];
    setLocalBoards(updated);
    onCreateBoard?.(newBoard);
    setNewBoardName('');
    setNewBoardColor(BOARD_COLORS[0]);
  };

  return (
    <div className="manage-boards-overlay" onClick={onClose}>
      <div
        className="manage-boards-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-boards-title"
      >
        {/* Header */}
        <div className="manage-boards-header">
          <h2 id="manage-boards-title" className="h5 fw-medium mb-0">Manage Boards</h2>
          <button
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        {/* Board List */}
        <div className="manage-boards-body">
          <div className="manage-boards-list">
            {localBoards.map(board => (
              <div key={board.id} className="manage-board-item">
                {editingId === board.id ? (
                  <BoardEditForm
                    board={board}
                    onSave={(updates) => {
                      handleUpdateBoard(board.id, updates);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="manage-board-row">
                    <div className="manage-board-color" style={{ background: board.color }} />
                    <span className="manage-board-label">{board.label}</span>
                    <div className="manage-board-actions ms-auto">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setEditingId(board.id)}
                        title="Edit board"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteBoard(board.id)}
                        title="Delete board"
                        disabled={localBoards.length <= 1}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Create New Board */}
          <div className="manage-board-create">
            <h3 className="h6 fw-medium mb-3">Create New Board</h3>
            <div className="d-flex gap-2 align-items-end">
              <div className="flex-grow-1">
                <label className="form-label text-sm">Board Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g., Testing, QA, Ready to Deploy..."
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label text-sm">Color</label>
                <div className="color-picker">
                  {BOARD_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-swatch ${newBoardColor === color ? 'active' : ''}`}
                      style={{ background: color }}
                      onClick={() => setNewBoardColor(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleCreateBoard}
                disabled={!newBoardName.trim()}
              >
                + Create
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="manage-boards-footer">
          <p className="text-xs text-secondary mb-0">
            Note: Boards represent task statuses. Deleting a board does not delete tasks.
          </p>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function BoardEditForm({ board, onSave, onCancel }) {
  const [label, setLabel] = useState(board.label);
  const [color, setColor] = useState(board.color);

  return (
    <div className="manage-board-edit-form">
      <div className="d-flex gap-2 align-items-end">
        <div className="flex-grow-1">
          <input
            type="text"
            className="form-control form-control-sm"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
          />
        </div>
        <div className="color-picker color-picker-sm">
          {BOARD_COLORS.map(c => (
            <button
              key={c}
              type="button"
              className={`color-swatch ${color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onSave({ label, color })}
        >
          Save
        </button>
        <button className="btn btn-outline-secondary btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}