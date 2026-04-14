import { useMemo } from 'react';

/**
 * @component ProjectStatsView
 * @description Dashboard shown on the project overview page.
 * Displays sprint completion, task counts, and epic counts using
 * data fetched by the parent page via useProject/useBacklog.
 *
 * @param {Object} props
 * @param {Object}   props.project  - Project record
 * @param {Object[]} props.epics    - Epics with nested tasks
 * @param {Object[]} props.sprints  - Sprints for the project
 * @param {boolean}  [props.loading=false]
 */
export function ProjectStatsView({ project = {}, epics = [], sprints = [], loading = false }) {
  const stats = useMemo(() => {
    const allTasks   = epics.flatMap(e => e.tasks ?? []);
    const doneTasks  = allTasks.filter(t => t.status === 'done');
    const activeSprint = sprints.find(s => s.status === 'active');
    const sprintTasks = activeSprint?.tasks ?? [];
    const sprintDone  = sprintTasks.filter(t => t.status === 'done').length;
    const sprintPct   = sprintTasks.length ? Math.round((sprintDone / sprintTasks.length) * 100) : 0;

    return {
      totalTasks:  allTasks.length,
      doneTasks:   doneTasks.length,
      totalEpics:  epics.length,
      sprintPct,
      activeSprint,
    };
  }, [epics, sprints]);

  if (loading) return <StatsSkeleton />;

  return (
    <div className="animate-in" aria-label={`${project.name ?? 'Project'} overview`}>
      {/* Page header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h5 fw-medium mb-1" title={project.name}>{project.name ?? 'Project'}</h1>
          {project.description && (
            <p className="text-sm text-secondary mb-0">{project.description}</p>
          )}
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm" title="Configure project settings" aria-label="Project settings">
            ⚙ Settings
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="row g-3 mb-4">
        <StatCard
          label="Active Sprint"
          value={stats.activeSprint?.name ?? 'No active sprint'}
          sub={stats.activeSprint ? `${stats.sprintPct}% complete` : 'Start a sprint to track progress'}
          icon="🚀"
          progress={stats.activeSprint ? stats.sprintPct : null}
          title="Current sprint status"
        />
        <StatCard
          label="Tasks"
          value={stats.totalTasks}
          sub={`${stats.doneTasks} done`}
          icon="✅"
          title="Total tasks in backlog"
        />
        <StatCard
          label="Epics"
          value={stats.totalEpics}
          sub="In backlog"
          icon="⚡"
          title="Total epics in this project"
        />
        <StatCard
          label="Sprints"
          value={sprints.length}
          sub={`${sprints.filter(s => s.status === 'done').length} completed`}
          icon="📅"
          title="Total number of sprints"
        />
      </div>

      {/* Epic breakdown */}
      {epics.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header" title="Epic progress breakdown">
            <h2 className="h6 mb-0 fw-medium">Epic Progress</h2>
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0 align-middle" title="List of epics and their completion">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40%' }} title="Epic name">Epic</th>
                  <th title="Number of tasks">Tasks</th>
                  <th title="Completion percentage">Progress</th>
                  <th title="Epic status">Status</th>
                </tr>
              </thead>
              <tbody>
                {epics.map(epic => {
                  const total = epic.tasks?.length ?? 0;
                  const done  = epic.tasks?.filter(t => t.status === 'done').length ?? 0;
                  const pct   = total ? Math.round((done / total) * 100) : 0;
                  return (
                    <tr key={epic.id} title={epic.name}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            style={{
                              width: '10px', height: '10px', borderRadius: '50%',
                              background: epic.color ?? 'var(--color-brand-500)',
                              flexShrink: 0,
                            }}
                            aria-hidden="true"
                          />
                          <span className="text-sm fw-medium truncate">{epic.name}</span>
                        </div>
                      </td>
                      <td className="text-sm text-secondary">{total}</td>
                      <td style={{ width: '200px' }}>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="progress flex-grow-1"
                            style={{ height: '6px' }}
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            title={`${pct}% complete`}
                          >
                            <div
                              className="progress-bar"
                              style={{
                                width: `${pct}%`,
                                background: epic.color ?? 'var(--color-brand-500)',
                              }}
                            />
                          </div>
                          <span className="text-xs text-secondary">{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          epic.status === 'done'        ? 'text-bg-success' :
                          epic.status === 'in_progress' ? 'text-bg-primary' :
                          'bg-secondary text-white'
                        }`} title={`Status: ${epic.status ?? 'todo'}`}>
                          {epic.status ?? 'todo'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {epics.length === 0 && (
        <div className="text-center py-5 text-secondary" aria-label="Empty backlog">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }} aria-hidden="true">📁</div>
          <p className="fw-medium mb-1">This project is empty</p>
          <p className="text-sm">Add epics and tasks in the Backlog to start tracking.</p>
        </div>
      )}
    </div>
  );
}

/* ── StatCard ── */
function StatCard({ label, value, sub, icon, progress, title }) {
  return (
    <div className="col-sm-6 col-xl-3">
      <div className="card border-0 shadow-sm h-100" title={title} aria-label={`${label}: ${value}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className="text-xs text-secondary fw-medium text-uppercase" style={{ letterSpacing: '0.06em' }}>
              {label}
            </span>
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">{icon}</span>
          </div>
          <div className="h4 fw-medium mb-1" style={{ color: 'var(--color-gray-900)' }}>{value}</div>
          <p className="text-xs text-secondary mb-0">{sub}</p>
          {progress !== null && progress !== undefined && (
            <div
              className="progress mt-2"
              style={{ height: '4px' }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              title={`${progress}% complete`}
            >
              <div className="progress-bar bg-primary" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="animate-in">
      <div className="row g-3 mb-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm p-3 placeholder-glow">
              <span className="placeholder col-6 rounded mb-2" />
              <span className="placeholder col-4 rounded" style={{ height: '2rem' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
