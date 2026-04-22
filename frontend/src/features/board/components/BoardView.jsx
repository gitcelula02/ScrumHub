import { useState, useCallback, useMemo } from 'react';
import { EpicBadge, StatusBadge, PriorityTag } from '@/components/ui';
import { useEntityTheme } from '@/hooks/useEntityTheme';
import { ManageBoardsModal } from './ManageBoardsModal';

const DEFAULT_COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'var(--color-gray-400)', icon: '○' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--color-brand-500)', icon: '◑' },
  { id: 'in_review', label: 'In Review', color: 'var(--color-warning)', icon: '◐' },
  { id: 'done', label: 'Done', color: 'var(--color-success)', icon: '●' },
  { id: 'blocked', label: 'Blocked', color: 'var(--color-danger)', icon: '✕' },
];

/**
 * @component BoardView
 * @description Kanban board with drag-and-drop, dynamic columns, sprint/user filtering.
 *
 * @param {Object} props
 * @param {Object} props.columns - { [status]: Task[] } from useBoard
 * @param {Object[]} props.sprints - Available sprints for filtering
 * @param {Object[]} props.members - Available team members for filtering
 * @param {string} props.selectedSprintId - Currently selected sprint ID
 * @param {string[]} props.selectedUserIds - Array of selected user IDs (empty = all)
 * @param {Function} props.onSprintChange - (sprintId) => void
 * @param {Function} props.onUserChange - (userIds[]) => void
 * @param {Function} props.onMoveTask - (taskId, newStatus) => void
 * @param {Function} props.onCreateBoard - (boardData) => void
 * @param {Function} props.onUpdateBoard - (boardId, boardData) => void
 * @param {Function} props.onDeleteBoard - (boardId) => void
 * @param {boolean} [props.loading]
 * @param {Function} [props.onTaskClick]
 */
export function BoardView({
  columns = {},
  loading = false,
  sprints = [],
  members = [],
  selectedSprintId = null,
  selectedUserIds = [],
  onSprintChange,
  onUserChange,
  onMoveTask,
  onCreateBoard,
  onUpdateBoard,
  onDeleteBoard,
  onTaskClick,
  customBoards = DEFAULT_COLUMNS,
}) {
  const [dragTaskId, setDragTaskId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);

  const handleDragStart = (taskId) => setDragTaskId(taskId);
  const handleDragEnd = () => { setDragTaskId(null); setOverColumn(null); };

  const handleDrop = useCallback((status) => {
    if (dragTaskId) onMoveTask?.(dragTaskId, status);
    setDragTaskId(null);
    setOverColumn(null);
  }, [dragTaskId, onMoveTask]);

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleUserToggle = (userId) => {
    const newUsers = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId];
    onUserChange?.(newUsers);
  };

  const selectedUsersLabel = useMemo(() => {
    if (selectedUserIds.length === 0) return 'All users';
    if (selectedUserIds.length === 1) {
      const user = members.find(m => m.id.toString() === selectedUserIds[0].toString());
      return user?.name ?? '1 user';
    }
    return `${selectedUserIds.length} users`;
  }, [selectedUserIds, members]);

  if (loading) return <BoardSkeleton customBoards={customBoards} />;

  return (
    <div className="board-view-wrapper">
      {/* Toolbar */}
      <div className="board-toolbar">
        <div className="d-flex gap-2 align-items-center flex-wrap flex-grow-1">
          {/* Sprint Selector */}
          <div className="board-filter-group">
            <select
              className="form-select form-select-sm"
              value={selectedSprintId ?? ''}
              onChange={(e) => onSprintChange?.(e.target.value || null)}
              aria-label="Select sprint"
            >
              <option value="">All sprints</option>
              {sprints.map(sprint => (
                <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div className="board-filter-group position-relative">
            <button
              className="btn btn-outline-secondary btn-sm dropdown-toggle"
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              aria-expanded={showUserDropdown}
            >
              👤 {selectedUsersLabel}
            </button>
            {showUserDropdown && (
              <div className="board-user-dropdown">
                <div className="board-user-dropdown-header">
                  <span className="text-sm fw-medium">Filter by user</span>
                  {selectedUserIds.length > 0 && (
                    <button
                      className="btn btn-link btn-sm p-0 text-decoration-none"
                      onClick={() => onUserChange?.([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="board-user-list">
                  {members.map(member => (
                    <label key={member.id} className="board-user-item">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(member.id.toString())}
                        onChange={() => handleUserToggle(member.id.toString())}
                      />
                      <span className="board-user-avatar">
                        {member.name?.[0]?.toUpperCase() ?? '?'}
                      </span>
                      <span className="board-user-name">{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manage Boards Button */}
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowManageModal(true)}
          title="Manage board columns"
        >
          ⚙ Manage Boards
        </button>
      </div>

      {/* Board Columns */}
      <div className="board-view" aria-label="Kanban board">
        {customBoards.map(col => {
          const tasks = columns[col.id] ?? [];
          const isOver = overColumn === col.id;
          return (
            <BoardColumn
              key={col.id}
              col={col}
              tasks={tasks}
              isOver={isOver}
              dragTaskId={dragTaskId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={() => setOverColumn(col.id)}
              onDrop={() => handleDrop(col.id)}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>

      {/* Manage Boards Modal */}
      {showManageModal && (
        <ManageBoardsModal
          boards={customBoards}
          onClose={() => setShowManageModal(false)}
          onCreate={onCreateBoard}
          onUpdate={onUpdateBoard}
          onDelete={onDeleteBoard}
        />
      )}
    </div>
  );
}

/* ── BoardColumn ─────────────────────────────────────── */
function BoardColumn({ col, tasks, isOver, dragTaskId, onDragStart, onDragEnd, onDragOver, onDrop, onTaskClick }) {
  return (
    <div
      className={`board-column ${isOver ? 'board-column--over' : ''}`}
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDrop={e => { e.preventDefault(); onDrop(); }}
      role="region"
      aria-label={`${col.label} column — ${tasks.length} tasks`}
    >
      {/* Column header */}
      <div className="board-col-header">
        <span
          className="board-col-indicator"
          style={{ background: col.color }}
        />
        <span className="text-sm fw-medium">{col.label}</span>
        <span className="board-col-count">{tasks.length}</span>
      </div>

      {/* Cards */}
      <div className="board-col-body">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            isDragging={dragTaskId === task.id}
            onDragStart={() => onDragStart(task.id)}
            onDragEnd={onDragEnd}
            onClick={() => onTaskClick?.(task.id)}
          />
        ))}

        {/* Empty drop zone */}
        {tasks.length === 0 && (
          <div className={`board-col-empty ${isOver ? 'board-col-empty--active' : ''}`}>
            {isOver ? 'Drop here' : `No ${col.label.toLowerCase()} tasks`}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── TaskCard ────────────────────────────────────────── */
function TaskCard({ task, isDragging, onDragStart, onDragEnd, onClick }) {
  const epicTheme = useEntityTheme(task.epic?.color);

  return (
    <div
      className={`board-task-card ${isDragging ? 'board-task-card--dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={task.title}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      {task.epic && (
        <div
          className="board-task-epic-bar"
          style={{ background: task.epic?.color ?? 'var(--color-brand-500)' }}
        />
      )}

      <p className="text-sm fw-medium mb-2 truncate">{task.title}</p>

      <div className="d-flex align-items-center gap-1 flex-wrap">
        {task.epic && <EpicBadge epic={task.epic} pill style={epicTheme} />}
        <PriorityTag priority={task.priority} labelOnly />
      </div>

      <div className="d-flex align-items-center justify-content-between mt-2">
        {task.dueDate && (
          <span className="text-xs text-secondary">
            📅 {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
        {task.assignee && (
          <div className="board-task-avatar ms-auto" title={task.assignee.name}>
            {task.assignee.avatarUrl
              ? <img src={task.assignee.avatarUrl} alt={task.assignee.name} width={20} height={20} />
              : task.assignee.name?.[0]?.toUpperCase()
            }
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────── */
function BoardSkeleton({ customBoards = DEFAULT_COLUMNS }) {
  return (
    <div>
      <div className="board-toolbar">
        <div className="skeleton" style={{ width: '150px', height: '32px' }} />
        <div className="skeleton" style={{ width: '120px', height: '32px' }} />
      </div>
      <div className="board-view">
        {customBoards.map(col => (
          <div key={col.id} className="board-column">
            <div className="board-col-header">
              <span className="placeholder col-6 rounded" />
            </div>
            <div className="board-col-body">
              {[1, 2].map(i => (
                <div key={i} className="board-task-card placeholder-glow mb-2">
                  <span className="placeholder col-10 rounded mb-1 d-block" style={{ height: '14px' }} />
                  <span className="placeholder col-6 rounded d-block" style={{ height: '10px' }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}