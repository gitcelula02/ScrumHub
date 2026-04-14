import { useState } from 'react';
import { EpicBadge, StatusBadge, PriorityTag } from '@/components/ui';
import { useEntityTheme } from '@/hooks/useEntityTheme';

/**
 * @component BacklogTable
 * @description Sortable, groupable backlog table for a project.
 * Renders epics as collapsible groups; tasks live inside each group.
 *
 * COLOR CONTRACT:
 * Each epic row carries a left-border accent via useEntityTheme.
 * Task rows inside an epic group inherit no color — they use neutral styling.
 * This keeps the visual hierarchy clear: color = epic, not task.
 *
 * RESPONSIBILITIES:
 * - Render structure and layout only
 * - Delegate color logic to useEntityTheme (via EpicGroupRow)
 * - Emit onTaskClick / onEpicClick to the parent page for navigation
 * - Does NOT fetch data — receives it via props from useBacklog hook
 *
 * @param {Object}    props
 * @param {Object[]}  props.epics            - Array of epic objects
 * @param {string}    props.epics[].id
 * @param {string}    props.epics[].name
 * @param {string}    props.epics[].color
 * @param {string}    props.epics[].status
 * @param {Object[]}  props.epics[].tasks    - Tasks nested under this epic
 * @param {boolean}   [props.loading=false]
 * @param {Function}  [props.onTaskClick]    - (taskId: string) => void
 * @param {Function}  [props.onEpicClick]    - (epicId: string) => void
 *
 * @example <caption>Inside BacklogPage</caption>
 * const { epics, loading } = useBacklog(projectId);
 * <BacklogTable
 *   epics={epics}
 *   loading={loading}
 *   onTaskClick={(id) => navigate(`/tasks/${id}`)}
 *   onEpicClick={(id) => setDetailId(id)}
 * />
 */
export function BacklogTable({ epics = [], loading = false, onTaskClick, onEpicClick }) {
  if (loading) return <BacklogSkeleton />;
  if (!epics.length) return <BacklogEmpty />;

  return (
    <div className="card border-0 shadow-sm">
      <div className="table-responsive">
        <table className="table table-hover mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: '36%' }}>Title</th>
              <th style={{ width: '14%' }}>Epic</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '10%' }}>Priority</th>
              <th style={{ width: '12%' }}>Assignee</th>
              <th style={{ width: '10%' }}>Due</th>
              <th style={{ width: '8%' }}></th>
            </tr>
          </thead>
          <tbody>
            {epics.map((epic) => (
              <EpicGroup
                key={epic.id}
                epic={epic}
                onTaskClick={onTaskClick}
                onEpicClick={onEpicClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── EpicGroup ─────────────────────────────────────────────
   Internal sub-component. Not exported — use BacklogTable.
   Manages the collapsed/expanded state for one epic's task list.
   Color comes from useEntityTheme scoped to the header row.
──────────────────────────────────────────────────────────── */
function EpicGroup({ epic, onTaskClick, onEpicClick }) {
  const [open, setOpen] = useState(true);
  const theme = useEntityTheme(epic.color);

  return (
    <>
      {/* Epic header row */}
      <tr
        className="entity-accent-border"
        style={{ ...theme, backgroundColor: 'var(--entity-bg)', cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}
      >
        <td colSpan={6}>
          <div className="d-flex align-items-center gap-2">
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: '14px',
                textAlign: 'center',
                fontSize: '0.65rem',
                color: 'var(--entity-fg)',
                transition: 'transform var(--transition-fast)',
                transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >▶</span>
            <span
              className="fw-medium text-sm"
              style={{ color: 'var(--entity-fg)' }}
              onClick={(e) => { e.stopPropagation(); onEpicClick?.(epic.id); }}
            >
              {epic.name}
            </span>
            <span className="text-xs" style={{ color: 'var(--entity-fg)', opacity: 0.7 }}>
              {epic.tasks?.length ?? 0} tasks
            </span>
          </div>
        </td>
        <td>
          <StatusBadge status={epic.status} />
        </td>
      </tr>

      {/* Task rows */}
      {open && epic.tasks?.map((task) => (
        <TaskRow key={task.id} task={task} epic={epic} onTaskClick={onTaskClick} />
      ))}
    </>
  );
}

/* ── TaskRow ───────────────────────────────────────────────
   Individual task row. Receives the parent epic for badge display.
   Indented visually but NOT colored — color belongs to the epic.
──────────────────────────────────────────────────────────── */
function TaskRow({ task, epic, onTaskClick }) {
  return (
    <tr
      className="animate-in"
      style={{ cursor: 'pointer' }}
      onClick={() => onTaskClick?.(task.id)}
    >
      <td>
        <div className="d-flex align-items-center gap-2">
          <span style={{ width: '20px', flexShrink: 0 }} />  {/* indent */}
          <span className="truncate text-sm">{task.title}</span>
        </div>
      </td>
      <td>
        <EpicBadge epic={epic} />
      </td>
      <td>
        <StatusBadge status={task.status} />
      </td>
      <td>
        <PriorityTag priority={task.priority} />
      </td>
      <td>
        {task.assignee && (
          <div className="d-flex align-items-center gap-1">
            <img
              src={task.assignee.avatarUrl}
              alt={task.assignee.name}
              title={task.assignee.name}
              width={22}
              height={22}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="text-xs text-truncate" style={{ maxWidth: '70px' }}>
              {task.assignee.name}
            </span>
          </div>
        )}
      </td>
      <td>
        {task.dueDate && (
          <span className="text-xs text-secondary">
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </td>
      <td>
        <button
          className="btn btn-sm btn-link text-secondary p-0"
          onClick={(e) => { e.stopPropagation(); onTaskClick?.(task.id); }}
          aria-label="Open task details"
        >
          →
        </button>
      </td>
    </tr>
  );
}

/* ── Loading skeleton ──────────────────────────────────── */
function BacklogSkeleton() {
  return (
    <div className="card border-0 shadow-sm p-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="d-flex gap-3 mb-3">
          <div className="placeholder-glow flex-grow-1">
            <span className="placeholder col-5 rounded" />
          </div>
          <div className="placeholder-glow" style={{ width: '80px' }}>
            <span className="placeholder col-12 rounded" />
          </div>
          <div className="placeholder-glow" style={{ width: '60px' }}>
            <span className="placeholder col-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────── */
function BacklogEmpty() {
  return (
    <div className="text-center py-5 text-secondary">
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
      <p className="mb-1 fw-medium">No epics yet</p>
      <p className="text-sm">Create your first epic to start organizing work.</p>
    </div>
  );
}
