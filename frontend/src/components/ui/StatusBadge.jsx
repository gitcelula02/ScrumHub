/**
 * @component StatusBadge
 * @description Displays a task/item status as a Bootstrap-based badge.
 * Uses semantic CSS variables — NOT entity colors. Status is a fixed enum,
 * not user-defined, so hardcoded palette is intentional here.
 *
 * @param {('todo'|'in_progress'|'in_review'|'done'|'blocked')} props.status
 * @param {string} [props.className]
 *
 * @example
 * <StatusBadge status="in_progress" />
 */
export function StatusBadge({ status, className = '' }) {
  const config = {
    todo:        { label: 'To Do',       cls: 'bg-secondary text-white' },
    in_progress: { label: 'In Progress', cls: 'text-bg-primary' },
    in_review:   { label: 'In Review',   cls: 'text-bg-warning' },
    done:        { label: 'Done',        cls: 'text-bg-success' },
    blocked:     { label: 'Blocked',     cls: 'text-bg-danger' },
  };

  const { label, cls } = config[status] ?? { label: status, cls: 'bg-secondary text-white' };

  return (
    <span className={`badge ${cls} ${className}`}>
      {label}
    </span>
  );
}

/**
 * @component PriorityTag
 * @description Displays a task priority as a small label with icon.
 * Semantic colors only — not user-defined, so fixed palette is correct.
 *
 * @param {('low'|'medium'|'high'|'critical')} props.priority
 * @param {boolean} [props.labelOnly=false] - Hide the icon
 * @param {string}  [props.className]
 *
 * @example
 * <PriorityTag priority="high" />
 */
export function PriorityTag({ priority, labelOnly = false, className = '' }) {
  const config = {
    low:      { label: 'Low',      color: 'var(--color-gray-400)',   icon: '↓' },
    medium:   { label: 'Medium',   color: 'var(--color-warning)',    icon: '→' },
    high:     { label: 'High',     color: 'var(--color-danger)',     icon: '↑' },
    critical: { label: 'Critical', color: '#7c3aed',                 icon: '‼' },
  };

  const { label, color, icon } = config[priority] ?? config.medium;

  return (
    <span
      className={`d-inline-flex align-items-center gap-1 text-xs fw-medium ${className}`}
      style={{ color }}
    >
      {!labelOnly && <span aria-hidden="true">{icon}</span>}
      {label}
    </span>
  );
}
