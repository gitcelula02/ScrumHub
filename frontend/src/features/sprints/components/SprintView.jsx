import { useState, useMemo } from 'react';
import { StatusBadge, PriorityTag } from '@/components/ui';
import { SprintCreateModal } from './SprintCreateModal';
import { SprintTreeView } from './SprintTreeView';
import { SprintRetrospective } from './SprintRetrospective';

/**
 * @component SprintView
 * @description Redesigned sprint view with selector navigation, task list,
 * tree view, and retrospective access.
 */
export function SprintView({
  sprints = [],
  backlog = [],
  loading = false,
  error = null,
  is404 = false,
  onCreateSprint,
}) {
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRetrospective, setShowRetrospective] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'tree'
  const [expandedTasks, setExpandedTasks] = useState({});

  const selectedSprint = useMemo(() =>
    sprints.find(s => s.id?.toString() === selectedSprintId?.toString()) ?? null
  , [sprints, selectedSprintId]);

  const currentIndex = useMemo(() =>
    sprints.findIndex(s => s.id?.toString() === selectedSprintId?.toString())
  , [sprints, selectedSprintId]);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < sprints.length - 1;

  const handlePrevSprint = () => {
    if (canGoPrev) {
      setSelectedSprintId(sprints[currentIndex - 1].id);
    }
  };

  const handleNextSprint = () => {
    if (canGoNext) {
      setSelectedSprintId(sprints[currentIndex + 1].id);
    }
  };

  const handleCreateSprint = (sprintData) => {
    onCreateSprint?.(sprintData);
    setShowCreateModal(false);
  };

  if (loading) return <SprintSkeleton />;

  if (error) return (
    <div className="alert alert-warning d-flex align-items-start gap-2">
      <span>⚠️</span>
      <div>
        <strong>Sprint endpoint unavailable</strong>
        <p className="mb-0 text-sm mt-1">{error}</p>
      </div>
    </div>
  );

  if (is404 || sprints.length === 0) {
    return (
      <div className="animate-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h5 fw-medium mb-0">Sprints</h1>
        </div>
        <div className="text-center py-5">
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>🚀</div>
          <h2 className="h5 fw-medium mb-2">No sprints yet</h2>
          <p className="text-secondary mb-4">Create your first sprint to start organizing your project.</p>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + New Sprint
          </button>
        </div>
        {showCreateModal && (
          <SprintCreateModal
            epics={backlog}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateSprint}
          />
        )}
      </div>
    );
  }

  const sprintTasks = selectedSprint?.tasks ?? [];
  const doneCount = sprintTasks.filter(t => t.status === 'done').length;
  const completionPct = sprintTasks.length
    ? Math.round((doneCount / sprintTasks.length) * 100)
    : 0;

  return (
    <div className="animate-in sprint-view">
      {/* Sprint Selector Header */}
      <div className="sprint-header">
        <div className="sprint-header-left">
          <h1 className="h5 fw-medium mb-0">Sprints</h1>
        </div>

        <div className="sprint-selector">
          <button
            className="sprint-nav-btn"
            onClick={handlePrevSprint}
            disabled={!canGoPrev}
            aria-label="Previous sprint"
          >
            ‹
          </button>

          <select
            className="sprint-select"
            value={selectedSprintId ?? ''}
            onChange={e => setSelectedSprintId(e.target.value || null)}
            aria-label="Select sprint"
          >
            <option value="">Select a sprint...</option>
            {sprints.map(sprint => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name} ({sprint.status})
              </option>
            ))}
          </select>

          <button
            className="sprint-nav-btn"
            onClick={handleNextSprint}
            disabled={!canGoNext}
            aria-label="Next sprint"
          >
            ›
          </button>
        </div>

        <div className="sprint-header-actions">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowRetrospective(true)}
            title="Open retrospective"
          >
            📋 Retrospective
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateModal(true)}
            title="Create new sprint"
          >
            + New Sprint
          </button>
        </div>
      </div>

      {/* Sprint Content */}
      {selectedSprint ? (
        <>
          {/* Sprint Info Bar */}
          <div className="sprint-info-bar">
            <div className="sprint-info-item">
              <span className="sprint-info-label">Purpose</span>
              <span className="sprint-info-value">
                {selectedSprint.purpose || 'No purpose set'}
              </span>
            </div>
            <div className="sprint-info-item">
              <span className="sprint-info-label">Duration</span>
              <span className="sprint-info-value">
                {selectedSprint.startDate
                  ? `${new Date(selectedSprint.startDate).toLocaleDateString()} → ${new Date(selectedSprint.endDate).toLocaleDateString()}`
                  : 'Dates not set'}
              </span>
            </div>
            <div className="sprint-info-item">
              <span className="sprint-info-label">Tasks</span>
              <span className="sprint-info-value">{sprintTasks.length}</span>
            </div>
            <div className="sprint-info-item sprint-info-progress">
              <span className="sprint-info-label">Completion</span>
              <div className="d-flex align-items-center gap-2">
                <div className="progress flex-grow-1" style={{ height: '8px', maxWidth: '120px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <span className="sprint-info-value">{completionPct}%</span>
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="sprint-view-toggle mb-3">
            <div className="btn-group">
              <button
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('list')}
              >
                ≡ List View
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'tree' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('tree')}
              >
                🔗 Tree View
              </button>
            </div>
          </div>

          {/* Sprint Tasks Display */}
          {viewMode === 'list' ? (
            <SprintTaskList
              tasks={sprintTasks}
              expandedTasks={expandedTasks}
              onToggleExpand={(id) => setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }))}
            />
          ) : (
            <SprintTreeView tasks={sprintTasks} />
          )}
        </>
      ) : (
        <div className="text-center py-5 text-secondary">
          <p>Select a sprint to view its tasks</p>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <SprintCreateModal
          epics={backlog}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSprint}
        />
      )}

      {showRetrospective && (
        <SprintRetrospective
          sprintId={selectedSprintId}
          onClose={() => setShowRetrospective(false)}
        />
      )}
    </div>
  );
}

/* ── SprintTaskList ─────────────────────────────────── */
function SprintTaskList({ tasks, expandedTasks, onToggleExpand }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-5 text-secondary">
        <p>No tasks in this sprint yet.</p>
      </div>
    );
  }

  return (
    <div className="sprint-task-list">
      {tasks.map(task => (
        <div key={task.id} className="sprint-task-card">
          <div
            className="sprint-task-header"
            onClick={() => onToggleExpand(task.id)}
            role="button"
            aria-expanded={!!expandedTasks[task.id]}
          >
            <StatusDot status={task.status} />
            <span className="sprint-task-title">{task.title}</span>
            <PriorityTag priority={task.priority} />
            {task.assignee && (
              <span className="sprint-task-assignee">{task.assignee.name?.[0]?.toUpperCase()}</span>
            )}
            {task.dependencies?.length > 0 && (
              <span className="sprint-task-deps" title={`${task.dependencies.length} dependencies`}>
                🔗 {task.dependencies.length}
              </span>
            )}
            <span className={`sprint-task-chevron ${expandedTasks[task.id] ? 'expanded' : ''}`}>
              ›
            </span>
          </div>

          {expandedTasks[task.id] && (
            <div className="sprint-task-details">
              {task.description && (
                <p className="text-sm text-secondary mb-2">{task.description}</p>
              )}
              {task.subtasks?.length > 0 && (
                <div className="sprint-task-subtasks">
                  <span className="text-xs text-secondary">Subtasks:</span>
                  {task.subtasks.map(sub => (
                    <div key={sub.id} className="sprint-task-subtask">
                      <StatusDot status={sub.status} />
                      <span className="text-sm">{sub.title}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-sm btn-outline-secondary">Edit</button>
                <button className="btn btn-sm btn-outline-secondary">Move</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── StatusDot ──────────────────────────────────────── */
function StatusDot({ status }) {
  const colors = {
    todo: 'var(--color-gray-400)',
    in_progress: 'var(--color-brand-500)',
    in_review: 'var(--color-warning)',
    done: 'var(--color-success)',
    blocked: 'var(--color-danger)',
  };
  return (
    <span
      style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: colors[status] || colors.todo,
        flexShrink: 0,
      }}
    />
  );
}

/* ── Skeleton ───────────────────────────────────────── */
function SprintSkeleton() {
  return (
    <div className="animate-in">
      <div className="sprint-header">
        <div className="skeleton" style={{ width: '100px', height: '32px' }} />
        <div className="skeleton" style={{ width: '300px', height: '40px' }} />
        <div className="skeleton" style={{ width: '150px', height: '32px' }} />
      </div>
      <div className="mt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card border-0 shadow-sm mb-2 p-3">
            <div className="d-flex gap-3">
              <div className="skeleton" style={{ width: '10px', height: '10px', marginTop: '4px' }} />
              <div className="flex-grow-1">
                <div className="skeleton mb-2" style={{ width: '60%', height: '16px' }} />
                <div className="skeleton" style={{ width: '40%', height: '12px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}