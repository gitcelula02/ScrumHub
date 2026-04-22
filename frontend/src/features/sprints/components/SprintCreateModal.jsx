import { useState } from 'react';

/**
 * @component SprintCreateModal
 * @description Full-screen modal for creating a new sprint.
 * Allows selecting tasks/epics, setting name, purpose, and dates.
 */
export function SprintCreateModal({ epics = [], onClose, onCreate }) {
  const [sprintName, setSprintName] = useState('');
  const [sprintPurpose, setSprintPurpose] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [selectedEpicIds, setSelectedEpicIds] = useState([]);

  const handleToggleEpic = (epicId) => {
    setSelectedEpicIds(prev =>
      prev.includes(epicId)
        ? prev.filter(id => id !== epicId)
        : [...prev, epicId]
    );
    // When selecting an epic, also select all its tasks
    const epic = epics.find(e => e.id === epicId);
    if (epic && !selectedEpicIds.includes(epicId)) {
      const epicTaskIds = epic.tasks?.map(t => t.id) ?? [];
      setSelectedTaskIds(prev => [...new Set([...prev, ...epicTaskIds])]);
    } else if (epic) {
      const epicTaskIds = epic.tasks?.map(t => t.id) ?? [];
      setSelectedTaskIds(prev => prev.filter(id => !epicTaskIds.includes(id)));
    }
  };

  const handleToggleTask = (taskId) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    const allTaskIds = epics.flatMap(e => e.tasks?.map(t => t.id) ?? []);
    setSelectedTaskIds(allTaskIds);
    setSelectedEpicIds(epics.map(e => e.id));
  };

  const handleSelectNone = () => {
    setSelectedTaskIds([]);
    setSelectedEpicIds([]);
  };

  const handleCreate = () => {
    if (!sprintName.trim() || !startDate || !endDate) return;

    const selectedTasks = epics
      .flatMap(e => e.tasks ?? [])
      .filter(t => selectedTaskIds.includes(t.id));

    onCreate?.({
      name: sprintName.trim(),
      purpose: sprintPurpose.trim(),
      startDate,
      endDate,
      tasks: selectedTasks,
    });
  };

  return (
    <div className="sprint-create-overlay" onClick={onClose}>
      <div className="sprint-create-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sprint-create-header">
          <h2 className="h5 fw-medium mb-0">Create New Sprint</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close" />
        </div>

        {/* Body */}
        <div className="sprint-create-body">
          <div className="row g-4">
            {/* Left column - Sprint details */}
            <div className="col-12 col-md-4">
              <div className="sprint-create-section">
                <h3 className="h6 fw-medium mb-3">Sprint Details</h3>

                <div className="mb-3">
                  <label className="form-label">Sprint Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Sprint 1 - MVP Features"
                    value={sprintName}
                    onChange={e => setSprintName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Purpose</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="What is the goal of this sprint?"
                    value={sprintPurpose}
                    onChange={e => setSprintPurpose(e.target.value)}
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">End Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="sprint-date-preview">
                    <span className="text-sm text-secondary">
                      Duration: {Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                )}
              </div>

              <div className="sprint-create-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h6 fw-medium mb-0">Select Tasks</h3>
                  <div className="d-flex gap-2">
                    <button className="btn btn-link btn-sm p-0" onClick={handleSelectAll}>Select all</button>
                    <button className="btn btn-link btn-sm p-0" onClick={handleSelectNone}>Clear</button>
                  </div>
                </div>
                <p className="text-xs text-secondary mb-3">
                  {selectedTaskIds.length} tasks selected
                </p>
              </div>
            </div>

            {/* Right column - Task selection */}
            <div className="col-12 col-md-8">
              <div className="sprint-create-section h-100">
                <h3 className="h6 fw-medium mb-3">Available Tasks</h3>
                <div className="sprint-task-list">
                  {epics.length === 0 ? (
                    <div className="text-center py-5 text-secondary">
                      <p>No tasks available. Create epics and tasks in the backlog first.</p>
                    </div>
                  ) : (
                    epics.map(epic => (
                      <div key={epic.id} className="sprint-epic-group">
                        <label className="sprint-epic-header">
                          <input
                            type="checkbox"
                            checked={selectedEpicIds.includes(epic.id)}
                            onChange={() => handleToggleEpic(epic.id)}
                          />
                          <span
                            className="sprint-epic-dot"
                            style={{ background: epic.color ?? 'var(--color-brand-500)' }}
                          />
                          <span className="fw-medium">{epic.name}</span>
                          <span className="text-xs text-secondary ms-auto">
                            {epic.tasks?.length ?? 0} tasks
                          </span>
                        </label>
                        <div className="sprint-task-items">
                          {epic.tasks?.map(task => (
                            <label key={task.id} className="sprint-task-item">
                              <input
                                type="checkbox"
                                checked={selectedTaskIds.includes(task.id)}
                                onChange={() => handleToggleTask(task.id)}
                              />
                              <StatusDot status={task.status} />
                              <span className="text-sm">{task.title}</span>
                              <PriorityBadge priority={task.priority} />
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sprint-create-footer">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={!sprintName.trim() || !startDate || !endDate}
          >
            Create Sprint
          </button>
        </div>
      </div>
    </div>
  );
}

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
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: colors[status] || colors.todo,
        flexShrink: 0,
      }}
    />
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    high: 'text-danger',
    medium: 'text-warning',
    low: 'text-success',
  };
  return (
    <span className={`badge bg-light text-secondary ${colors[priority] || ''}`}>
      {priority}
    </span>
  );
}