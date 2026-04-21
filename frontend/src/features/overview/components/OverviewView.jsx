import { useMemo, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { StatCard } from '@/features/projects/components/StatCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export function OverviewView({
  stats,
  velocityData,
  teamWorkload,
  overdueTasks,
  upcomingDeadlines,
  recentActivity,
  chatNotifications,
  nextDaily,
  userTasks,
  projectDescription,
  loading = false,
  onUpdateDescription,
}) {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(projectDescription);

  const handleSaveDescription = () => {
    onUpdateDescription?.(editedDescription);
    setIsEditingDescription(false);
  };

  const completionPct = stats ? Math.round((stats.doneTasks / stats.totalTasks) * 100) || 0 : 0;

  const velocityChartData = useMemo(() => ({
    labels: velocityData.map(v => v.sprint),
    datasets: [{
      label: 'Tasks Completed',
      data: velocityData.map(v => v.completed),
      backgroundColor: 'rgba(107, 92, 255, 0.7)',
      borderColor: 'rgba(107, 92, 255, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }), [velocityData]);

  const workloadChartData = useMemo(() => ({
    labels: teamWorkload.map(w => w.name),
    datasets: [{
      label: 'Tasks Assigned',
      data: teamWorkload.map(w => w.tasks),
      backgroundColor: [
        'rgba(107, 92, 255, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
      ],
      borderWidth: 0,
    }],
  }), [teamWorkload]);

  const priorityData = useMemo(() => {
    if (!stats) return null;
    const high = overdueTasks.length;
    const medium = Math.floor(stats.totalTasks * 0.3);
    const low = stats.totalTasks - high - medium;
    return {
      labels: ['High', 'Medium', 'Low'],
      datasets: [{
        data: [high, medium, low],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderWidth: 0,
      }],
    };
  }, [stats, overdueTasks]);

  const userTasksInProgress = userTasks.filter(t => t.status === 'in_progress' || t.status === 'todo');
  const userClosestTasks = [...userTasks]
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 5 } },
      x: { grid: { display: false } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } },
  };

  if (loading) return <OverviewSkeleton />;

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div className="flex-grow-1">
          <h1 className="h5 fw-medium mb-1">{stats?.project?.name ?? 'Project Overview'}</h1>
          {isEditingDescription ? (
            <div className="d-flex gap-2 align-items-start">
              <textarea
                className="form-control form-control-sm"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={2}
                style={{ maxWidth: '400px' }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleSaveDescription}>Save</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditingDescription(false)}>Cancel</button>
            </div>
          ) : (
            <p
              className="text-sm text-secondary mb-0 cursor-pointer"
              onClick={() => { setEditedDescription(projectDescription); setIsEditingDescription(true); }}
              style={{ cursor: 'pointer' }}
            >
              {projectDescription || 'Click to add project description...'}
            </p>
          )}
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm">⚙ Settings</button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="row g-3 mb-4">
        <StatCard
          label="Completion"
          value={`${completionPct}%`}
          sub={`${stats?.doneTasks ?? 0} of ${stats?.totalTasks ?? 0} tasks`}
          icon="📊"
          progress={completionPct}
          title="Project completion percentage"
        />
        <StatCard
          label="Team Members"
          value={stats?.members?.length ?? 0}
          sub={stats?.userRole ? `You are ${stats.userRole}` : 'Join a team'}
          icon="👥"
          title="Project team size"
        />
        <StatCard
          label="Overdue Tasks"
          value={overdueTasks.length}
          sub="Require attention"
          icon="⚠️"
          title="Tasks past due date"
        />
        <StatCard
          label="Next Daily"
          value={nextDaily ? formatNextDaily(nextDaily) : 'Not scheduled'}
          sub={nextDaily ? formatTimeUntil(nextDaily) : 'Schedule a daily'}
          icon="📅"
          title="Next daily standup"
        />
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        {/* Project Completion Bar */}
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header">
              <h2 className="h6 mb-0 fw-medium">Project Progress</h2>
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="text-center mb-3">
                <span className="h2 fw-bold" style={{ color: 'var(--color-brand-500)' }}>{completionPct}%</span>
              </div>
              <div className="progress" style={{ height: '12px' }} role="progressbar" aria-valuenow={completionPct}>
                <div className="progress-bar bg-primary" style={{ width: `${completionPct}%` }} />
              </div>
              <p className="text-center text-secondary text-sm mt-2 mb-0">
                {stats?.doneTasks ?? 0} completed / {stats?.totalTasks ?? 0} total
              </p>
            </div>
          </div>
        </div>

        {/* Velocity Chart */}
        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0 fw-medium">Sprint Velocity</h2>
              <span className="text-xs text-secondary">Last 5 sprints</span>
            </div>
            <div className="card-body">
              <div style={{ height: '180px' }}>
                <Bar data={velocityChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="row g-3 mb-4">
        {/* Priority Distribution */}
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header">
              <h2 className="h6 mb-0 fw-medium">Task Priority</h2>
            </div>
            <div className="card-body">
              {priorityData ? (
                <div style={{ height: '160px', maxWidth: '160px', margin: '0 auto' }}>
                  <Doughnut data={priorityData} options={doughnutOptions} />
                </div>
              ) : (
                <p className="text-secondary text-sm text-center">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* Team Workload */}
        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0 fw-medium">Team Workload</h2>
              <span className="text-xs text-secondary">Tasks per member</span>
            </div>
            <div className="card-body">
              <div style={{ height: '160px' }}>
                <Bar data={workloadChartData} options={{ ...chartOptions, indexAxis: 'y' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Tasks Row */}
      <div className="row g-3 mb-4">
        {/* My Closest Tasks */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0 fw-medium">My Closest Tasks</h2>
              <span className="badge bg-primary">{userClosestTasks.length}</span>
            </div>
            <div className="card-body p-0">
              {userClosestTasks.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {userClosestTasks.map(task => (
                    <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-medium text-sm">{task.title}</span>
                        {task.dueDate && (
                          <span className="text-xs text-secondary d-block">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <StatusBadge status={task.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-secondary text-sm text-center py-4 mb-0">No upcoming tasks</p>
              )}
            </div>
          </div>
        </div>

        {/* Ongoing Tasks */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0 fw-medium">My Ongoing Tasks</h2>
              <span className="badge bg-info">{userTasksInProgress.length}</span>
            </div>
            <div className="card-body p-0">
              {userTasksInProgress.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {userTasksInProgress.slice(0, 5).map(task => (
                    <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-medium text-sm">{task.title}</span>
                        {task.epicName && (
                          <span className="text-xs text-secondary d-block">{task.epicName}</span>
                        )}
                      </div>
                      <PriorityTag priority={task.priority} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-secondary text-sm text-center py-4 mb-0">No ongoing tasks</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="row g-3 mb-4">
        {/* Team Members */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0 fw-medium">Team Members</h2>
              <span className="badge bg-secondary">{stats?.members?.length ?? 0}</span>
            </div>
            <div className="card-body p-0">
              {stats?.members?.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {stats.members.map(member => (
                    <li key={member.id} className="list-group-item d-flex align-items-center gap-2">
                      <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                        {member.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-grow-1">
                        <span className="fw-medium text-sm">{member.name}</span>
                        <span className="text-xs text-secondary d-block">{member.role}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-secondary text-sm text-center py-4 mb-0">No team members</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0 fw-medium">Recent Activity</h2>
              <span className="text-xs text-secondary">Last actions</span>
            </div>
            <div className="card-body p-0">
              {recentActivity.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {recentActivity.map(activity => (
                    <li key={activity.id} className="list-group-item d-flex align-items-start gap-2">
                      <ActivityIcon type={activity.type} />
                      <div className="flex-grow-1">
                        <span className="text-sm">{activity.description}</span>
                        <span className="text-xs text-secondary d-block">{activity.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-secondary text-sm text-center py-4 mb-0">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Notifications */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0 fw-medium">Chat Notifications</h2>
              <span className="text-xs text-secondary">Unread messages</span>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6">
                  <span className="h4 fw-bold d-block" style={{ color: 'var(--color-brand-500)' }}>
                    {chatNotifications.mentions}
                  </span>
                  <span className="text-xs text-secondary">Mentions</span>
                </div>
                <div className="col-6">
                  <span className="h4 fw-bold d-block" style={{ color: 'var(--color-info)' }}>
                    {chatNotifications.totalMessages}
                  </span>
                  <span className="text-xs text-secondary">Messages</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0 fw-medium">Upcoming Deadlines</h2>
              <span className="badge bg-warning text-dark">{upcomingDeadlines.length}</span>
            </div>
            <div className="card-body p-0">
              {upcomingDeadlines.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {upcomingDeadlines.slice(0, 4).map(task => (
                    <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="text-sm fw-medium">{task.title}</span>
                      <span className="text-xs text-secondary">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-secondary text-sm text-center py-4 mb-0">No upcoming deadlines</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="animate-in">
      <div className="d-flex align-items-start justify-content-between mb-4">
        <div>
          <div className="skeleton skeleton-title mb-2" style={{ width: '150px', height: '24px' }} />
          <div className="skeleton skeleton-text" style={{ width: '250px', height: '16px' }} />
        </div>
      </div>
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="skeleton skeleton-text mb-2" style={{ width: '80px', height: '12px' }} />
                <div className="skeleton skeleton-title mb-2" style={{ width: '60px', height: '28px' }} />
                <div className="skeleton skeleton-text" style={{ width: '100px', height: '12px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    done: 'bg-success',
    in_progress: 'bg-primary',
    todo: 'bg-secondary',
    blocked: 'bg-danger',
  };
  return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{status?.replace('_', ' ')}</span>;
}

function PriorityTag({ priority }) {
  const colors = {
    high: 'text-danger',
    medium: 'text-warning',
    low: 'text-success',
  };
  return <span className={`badge bg-light text-secondary ${colors[priority] || ''}`}>{priority}</span>;
}

function ActivityIcon({ type }) {
  const icons = {
    task_completed: '✅',
    comment_added: '💬',
    epic_created: '⚡',
    sprint_started: '🚀',
    task_assigned: '👤',
  };
  return <span style={{ fontSize: '1rem' }}>{icons[type] || '📌'}</span>;
}

function formatNextDaily(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTimeUntil(isoString) {
  const now = new Date();
  const target = new Date(isoString);
  const diffMs = target - now;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHrs / 24);

  if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  if (diffHrs > 0) return `in ${diffHrs} hour${diffHrs > 1 ? 's' : ''}`;
  return 'soon';
}