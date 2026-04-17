import { useState, useCallback } from 'react';
import { EpicBadge, StatusBadge, PriorityTag } from '@/components/ui';
import { useEntityTheme } from '@/hooks/useEntityTheme';

const COLUMN_DEFS = [
  { id: 'todo',        label: 'To Do',       color: 'var(--color-gray-400)',  icon: '○' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--color-brand-500)', icon: '◑' },
  { id: 'in_review',   label: 'In Review',   color: 'var(--color-warning)',   icon: '◐' },
  { id: 'done',        label: 'Done',        color: 'var(--color-success)',   icon: '●' },
  { id: 'blocked',     label: 'Blocked',     color: 'var(--color-danger)',    icon: '✕' },
];

/**
 * @component BoardView
 * @description Kanban board rendering task columns with HTML5 drag-and-drop.
 * Tasks are grouped by status into draggable columns.
 *
 * COLOR CONTRACT:
 * Column header accent colors are fixed semantic colors (not entity colors).
 * Task cards may show EpicBadge which consumes --entity-* vars from ThemeRegistry.
 *
 * @param {Object}   props
 * @param {Object}   props.columns       - { [status]: Task[] } from useBoard
 * @param {boolean}  [props.loading]
 * @param {Function} props.onMoveTask    - (taskId, newStatus) => void
 * @param {Function} [props.onTaskClick] - (taskId) => void
 */
export function BoardView({ columns = {}, loading = false, onMoveTask, onTaskClick }) {
  const [dragTaskId, setDragTaskId]   = useState(null);
  const [overColumn, setOverColumn]   = useState(null);

  const handleDragStart = (taskId) => setDragTaskId(taskId);
  const handleDragEnd   = () => { setDragTaskId(null); setOverColumn(null); };

  const handleDrop = useCallback((status) => {
    if (dragTaskId) onMoveTask?.(dragTaskId, status);
    setDragTaskId(null);
    setOverColumn(null);
  }, [dragTaskId, onMoveTask]);

  if (loading) return <BoardSkeleton />;

  return (
    <div className="board-view" aria-label="Kanban board" title="Task board">
      {COLUMN_DEFS.map(col => {
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
      title={`${col.label} column`}
    >
      {/* Column header */}
      <div className="board-col-header">
        <span
          className="board-col-indicator"
          style={{ background: col.color }}
          aria-hidden="true"
        />
        <span className="text-sm fw-medium" title={col.label}>{col.label}</span>
        <span
          className="board-col-count ms-auto"
          title={`${tasks.length} tasks in ${col.label}`}
          aria-label={`${tasks.length} tasks`}
        >
          {tasks.length}
        </span>
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
          <div
            className={`board-col-empty ${isOver ? 'board-col-empty--active' : ''}`}
            aria-label={`Drop tasks here for ${col.label}`}
          >
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
      aria-label={`Task: ${task.title}`}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      {/* Epic accent top border */}
      {task.epic && (
        <div
          className="board-task-epic-bar"
          style={{ background: task.epic?.color ?? 'var(--color-brand-500)' }}
          aria-hidden="true"
        />
      )}

      <p className="text-sm fw-medium mb-2 truncate" title={task.title}>{task.title}</p>

      <div className="d-flex align-items-center gap-1 flex-wrap">
        {task.epic && <EpicBadge epic={task.epic} pill style={epicTheme} />}
        <PriorityTag priority={task.priority} labelOnly />
      </div>

      <div className="d-flex align-items-center justify-content-between mt-2">
        {task.dueDate && (
          <span className="text-xs text-secondary" title={`Due: ${task.dueDate}`}>
            📅 {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
        {task.assignee && (
          <div
            className="board-task-avatar ms-auto"
            title={`Assigned to ${task.assignee.name}`}
            aria-label={`Assigned to ${task.assignee.name}`}
          >
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
function BoardSkeleton() {
  return (
    <div className="board-view" aria-busy="true" aria-label="Loading board">
      {COLUMN_DEFS.map(col => (
        <div key={col.id} className="board-column">
          <div className="board-col-header placeholder-glow">
            <span className="placeholder col-6 rounded" />
          </div>
          <div className="board-col-body">
            {[1,2].map(i => (
              <div key={i} className="board-task-card placeholder-glow mb-2">
                <span className="placeholder col-10 rounded mb-1" style={{ height: '14px', display: 'block' }} />
                <span className="placeholder col-6 rounded" style={{ height: '10px', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
