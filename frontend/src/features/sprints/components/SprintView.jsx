import { useState, useCallback } from 'react';
import { StatusBadge, PriorityTag } from '@/components/ui';

/**
 * @component SprintView
 * @description Sprint management view. Lists all sprints for a project
 * with task assignments. Handles empty state for missing backend endpoint.
 *
 * @param {Object}   props
 * @param {Object[]} props.sprints    - Array of sprint objects
 * @param {Object[]} props.backlog    - Available backlog tasks for assignment
 * @param {boolean}  [props.loading]
 * @param {string}   [props.error]
 */
export function SprintView({ sprints = [], backlog = [], loading = false, error = null }) {
  const [activeSprint, setActiveSprint] = useState(null);

  if (loading) return <SprintSkeleton />;

  if (error) return (
    <div className="alert alert-warning d-flex align-items-start gap-2" role="alert">
      <span aria-hidden="true">⚠️</span>
      <div>
        <strong>Sprint endpoint unavailable</strong>
        <p className="mb-0 text-sm mt-1">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-in" aria-label="Sprint management view">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h1 className="h5 fw-medium mb-0" title="Sprints">Sprints</h1>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary btn-sm"
            title="Create a new sprint"
            aria-label="Create sprint"
          >
            + New Sprint
          </button>
        </div>
      </div>

      {/* Sprint list */}
      {sprints.length === 0 ? (
        <div className="text-center py-5 text-secondary" aria-label="No sprints">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }} aria-hidden="true">🚀</div>
          <p className="fw-medium mb-1">No sprints yet</p>
          <p className="text-sm mb-3">Create a sprint and assign tasks from your backlog to start tracking.</p>
          <button
            className="btn btn-primary"
            title="Create your first sprint"
            aria-label="Create first sprint"
          >
            Create first sprint
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {sprints.map(sprint => (
            <SprintCard
              key={sprint.id}
              sprint={sprint}
              isActive={activeSprint === sprint.id}
              onToggle={() => setActiveSprint(id => id === sprint.id ? null : sprint.id)}
            />
          ))}
        </div>
      )}

      {/* Backlog panel — shown alongside when endpoint returns data */}
      {sprints.length > 0 && backlog.length > 0 && (
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h2 className="h6 fw-medium mb-0" title="Unassigned backlog tasks">Backlog — Unassigned</h2>
            <span className="badge bg-secondary" aria-label={`${backlog.length} tasks`}>{backlog.length}</span>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle" title="Unassigned backlog tasks">
                <thead className="table-light">
                  <tr>
                    <th title="Task title">Title</th>
                    <th title="Task priority">Priority</th>
                    <th title="Task status">Status</th>
                    <th title="Assign to sprint"></th>
                  </tr>
                </thead>
                <tbody>
                  {backlog.map(task => (
                    <tr key={task.id} title={task.title}>
                      <td className="text-sm">{task.title}</td>
                      <td><PriorityTag priority={task.priority} /></td>
                      <td><StatusBadge status={task.status} /></td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Assign this task to an active sprint"
                          aria-label={`Assign ${task.title} to sprint`}
                        >
                          Assign →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── SprintCard ─────────────────────────────────────── */
function SprintCard({ sprint, isActive, onToggle }) {
  const tasks   = sprint.tasks ?? [];
  const done    = tasks.filter(t => t.status === 'done').length;
  const pct     = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const statusColor = {
    active:   'text-bg-primary',
    done:     'text-bg-success',
    planning: 'bg-secondary text-white',
  }[sprint.status] ?? 'bg-secondary text-white';

  return (
    <div className="card border-0 shadow-sm" aria-label={`Sprint: ${sprint.name}`} title={sprint.name}>
      {/* Sprint header */}
      <div
        className="card-header d-flex align-items-center gap-3 cursor-pointer"
        onClick={onToggle}
        style={{ cursor: 'pointer' }}
        title={`${sprint.name} — click to expand`}
        aria-expanded={isActive}
        role="button"
      >
        <span className="fw-medium text-sm flex-grow-1">{sprint.name}</span>

        <span className="text-xs text-secondary" title="Sprint date range">
          {sprint.startDate
            ? `${new Date(sprint.startDate).toLocaleDateString()} → ${new Date(sprint.endDate).toLocaleDateString()}`
            : 'Dates not set'}
        </span>

        <span className={`badge ${statusColor}`} title={`Status: ${sprint.status}`}>
          {sprint.status ?? 'planning'}
        </span>

        {/* Progress bar */}
        <div
          className="d-flex align-items-center gap-2"
          style={{ minWidth: '120px' }}
          title={`${pct}% complete`}
          aria-label={`${pct}% complete`}
        >
          <div className="progress flex-grow-1" style={{ height: '6px' }}>
            <div className="progress-bar bg-primary" style={{ width: `${pct}%` }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} />
          </div>
          <span className="text-xs text-secondary">{pct}%</span>
        </div>

        <span aria-hidden="true" style={{ transition: 'transform 200ms', transform: isActive ? 'rotate(90deg)' : 'none', color: 'var(--color-gray-400)' }}>›</span>
      </div>

      {/* Sprint task list */}
      {isActive && (
        <div className="card-body p-0">
          {tasks.length === 0 ? (
            <div className="text-center py-4 text-secondary text-sm" aria-label="No tasks in sprint">
              No tasks assigned to this sprint yet.
            </div>
          ) : (
            <table className="table table-hover mb-0 align-middle" title={`Tasks in ${sprint.name}`}>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} title={task.title}>
                    <td className="text-sm ps-3">{task.title}</td>
                    <td><PriorityTag priority={task.priority} /></td>
                    <td><StatusBadge status={task.status} /></td>
                    <td className="text-xs text-secondary">
                      {task.assignee?.name ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="px-3 py-2 border-top d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary" title="Add tasks from backlog" aria-label="Add tasks to sprint">
              + Add tasks
            </button>
            {sprint.status === 'planning' && (
              <button className="btn btn-sm btn-primary ms-auto" title="Start this sprint" aria-label="Start sprint">
                Start Sprint ▷
              </button>
            )}
            {sprint.status === 'active' && (
              <button className="btn btn-sm btn-success ms-auto" title="Complete this sprint" aria-label="Complete sprint">
                Complete Sprint ✓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SprintSkeleton() {
  return (
    <div className="d-flex flex-column gap-3">
      {[1,2].map(i => (
        <div key={i} className="card border-0 shadow-sm p-3 placeholder-glow">
          <div className="d-flex gap-3">
            <span className="placeholder col-4 rounded" />
            <span className="placeholder col-3 rounded" />
            <span className="placeholder col-2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
