import { useMemo } from 'react';

import { StatCard } from './StatCard';
import { StatsSkeleton } from './StatsSkeleton';
import { EpicRow } from './EpicRow';

/**
 * @component ProjectStatsView
 * @description Dashboard shown on the project overview page.
 * Displays sprint completion, task counts, and epic counts using
 * data fetched by the parent page via useProject/useBacklog.
 *
 * @param {Object} props
 * @param {Object} props.project - Project record
 * @param {Object[]} props.epics - Epics with nested tasks
 * @param {Object[]} props.sprints - Sprints for the project
 * @param {boolean} [props.loading=false]
 */
export function ProjectStatsView({
  project = {},
  epics = [],
  sprints = [],
  loading = false,
}) {
  const stats = useMemo(() => {
    const allTasks = epics.flatMap(e => e.tasks ?? []);
    const doneTasks = allTasks.filter(t => t.status === 'done');
    const activeSprint = sprints.find(s => s.status === 'active');
    const sprintTasks = activeSprint?.tasks ?? [];
    const sprintDone = sprintTasks.filter(t => t.status === 'done').length;
    const sprintPct = sprintTasks.length
      ? Math.round((sprintDone / sprintTasks.length) * 100)
      : 0;

    return {
      totalTasks: allTasks.length,
      doneTasks: doneTasks.length,
      totalEpics: epics.length,
      sprintPct,
      activeSprint,
    };
  }, [epics, sprints]);

  if (loading) return <StatsSkeleton />;

  return (
    <div className="animate-in" aria-label={`${project.name ?? 'Project'} overview`}>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h5 fw-medium mb-1" title={project.name}>
            {project.name ?? 'Project'}
          </h1>
          {project.description && (
            <p className="text-sm text-secondary mb-0">{project.description}</p>
          )}
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            title="Configure project settings"
            aria-label="Project settings"
          >
            ⚙ Settings
          </button>
        </div>
      </div>

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

      {epics.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header" title="Epic progress breakdown">
            <h2 className="h6 mb-0 fw-medium">Epic Progress</h2>
          </div>
          <div className="card-body p-0">
            <table
              className="table table-hover mb-0 align-middle"
              title="List of epics and their completion"
            >
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40%' }} title="Epic name">Epic</th>
                  <th title="Number of tasks">Tasks</th>
                  <th title="Completion percentage">Progress</th>
                  <th title="Epic status">Status</th>
                </tr>
              </thead>
              <tbody>
                {epics.map(epic => (
                  <EpicRow key={epic.id} epic={epic} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {epics.length === 0 && (
        <div className="text-center py-5 text-secondary" aria-label="Empty backlog">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }} aria-hidden="true">
            📁
          </div>
          <p className="fw-medium mb-1">This project is empty</p>
          <p className="text-sm">Add epics and tasks in the Backlog to start tracking.</p>
        </div>
      )}
    </div>
  );
}