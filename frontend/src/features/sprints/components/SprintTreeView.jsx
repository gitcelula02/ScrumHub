import { useMemo } from 'react';

/**
 * @component SprintTreeView
 * @description Tree visualization of sprint tasks showing dependencies.
 * Tasks without dependencies are main nodes, branching into subtasks.
 * Dependencies shown with dotted lines connecting tasks.
 */
export function SprintTreeView({ tasks = [] }) {
  const { taskLevels } = useMemo(() => {
    const map = {};
    const levels = {};

    tasks.forEach(task => {
      map[task.id] = task;
      if (!task.dependencies || task.dependencies.length === 0) {
        levels[task.id] = 0;
      }
    });

    // Calculate levels based on dependencies
    const calculateLevel = (taskId, visited = new Set()) => {
      if (levels[taskId] !== undefined) return levels[taskId];
      if (visited.has(taskId)) return 0;
      visited.add(taskId);

      const task = map[taskId];
      if (!task?.dependencies?.length) {
        levels[taskId] = 0;
        return 0;
      }

      const maxDepLevel = Math.max(
        ...task.dependencies.map(depId => calculateLevel(depId, visited))
      );
      levels[taskId] = maxDepLevel + 1;
      return levels[taskId];
    };

    tasks.forEach(task => calculateLevel(task.id));

    // Group by level
    const byLevel = {};
    Object.entries(levels).forEach(([taskId, level]) => {
      if (!byLevel[level]) byLevel[level] = [];
      byLevel[level].push(map[taskId]);
    });

    return { taskLevels: byLevel };
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="sprint-tree-empty">
        <div style={{ fontSize: '3rem', opacity: 0.3 }}>🔗</div>
        <p className="text-secondary mt-2">No tasks to display in tree view</p>
      </div>
    );
  }

  const maxLevel = Math.max(...Object.keys(taskLevels).map(Number), 0);

  return (
    <div className="sprint-tree-wrapper">
      <div className="sprint-tree-container">
        {/* SVG for dependency lines */}
        <svg className="sprint-tree-lines" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="rgba(107, 92, 255, 0.4)" />
            </marker>
          </defs>
          {tasks.map(task =>
            task.dependencies?.map(depId => {
              const sourceEl = document.getElementById(`tree-task-${depId}`);
              const targetEl = document.getElementById(`tree-task-${task.id}`);
              if (!sourceEl || !targetEl) return null;

              const sourceRect = sourceEl.getBoundingClientRect();
              const targetRect = targetEl.getBoundingClientRect();
              const containerRect = sourceEl.closest('.sprint-tree-container')?.getBoundingClientRect();
              if (!containerRect) return null;

              const x1 = sourceRect.right - containerRect.left;
              const y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top;
              const x2 = targetRect.left - containerRect.left;
              const y2 = targetRect.top + targetRect.height / 2 - containerRect.top;

              const midX = (x1 + x2) / 2;

              return (
                <g key={`${depId}-${task.id}`}>
                  <path
                    d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                    stroke="rgba(107, 92, 255, 0.3)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })
          )}
        </svg>

        {/* Tree nodes by level */}
        {Array.from({ length: maxLevel + 1 }, (_, level) => (
          <div key={level} className="sprint-tree-level">
            {taskLevels[level]?.map(task => (
              <TreeNode key={task.id} task={task} isRoot={level === 0} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TreeNode({ task, isRoot }) {
  const statusColors = {
    todo: { bg: 'var(--color-gray-100)', border: 'var(--color-gray-400)', text: 'var(--color-gray-700)' },
    in_progress: { bg: 'rgba(107, 92, 255, 0.1)', border: 'var(--color-brand-500)', text: 'var(--color-brand-700)' },
    in_review: { bg: 'rgba(245, 158, 11, 0.1)', border: 'var(--color-warning)', text: 'var(--color-warning)' },
    done: { bg: 'rgba(34, 197, 94, 0.1)', border: 'var(--color-success)', text: 'var(--color-success)' },
    blocked: { bg: 'rgba(239, 68, 68, 0.1)', border: 'var(--color-danger)', text: 'var(--color-danger)' },
  };

  const colors = statusColors[task.status] || statusColors.todo;

  return (
    <div
      id={`tree-task-${task.id}`}
      className={`sprint-tree-node ${isRoot ? 'sprint-tree-node--root' : ''}`}
      style={{
        background: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="sprint-tree-node-header">
        <span
          className="sprint-tree-status-dot"
          style={{ background: colors.border }}
        />
        <span className="sprint-tree-title">{task.title}</span>
      </div>
      <div className="sprint-tree-node-meta">
        {task.assignee && (
          <span className="sprint-tree-assignee">
            {task.assignee.name?.[0]?.toUpperCase() ?? '?'}
          </span>
        )}
        <span
          className="badge"
          style={{ background: colors.border, color: '#fff', fontSize: '0.65rem' }}
        >
          {task.status?.replace('_', ' ')}
        </span>
      </div>
      {isRoot && <div className="sprint-tree-branch-indicator">← Root</div>}
    </div>
  );
}