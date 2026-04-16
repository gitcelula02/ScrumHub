/**
 * @component StatCard
 * @description Reusable stat card for dashboard grids. Displays a metric
 * with label, optional progress bar, and icon.
 *
 * @param {Object} props
 * @param {string} props.label - Uppercase category label
 * @param {string|number} props.value - Main metric value
 * @param {string} props.sub - Supporting text below value
 * @param {string} props.icon - Emoji or icon character
 * @param {number|null} [props.progress] - Optional 0-100 for progress bar
 * @param {string} props.title - Tooltip text for accessibility
 */
export function StatCard({ label, value, sub, icon, progress, title }) {
  return (
    <div className="col-sm-6 col-xl-3">
      <div
        className="card border-0 shadow-sm h-100"
        title={title}
        aria-label={`${label}: ${value}`}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span
              className="text-xs text-secondary fw-medium text-uppercase"
              style={{ letterSpacing: '0.06em' }}
            >
              {label}
            </span>
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">
              {icon}
            </span>
          </div>
          <div className="h4 fw-medium mb-1" style={{ color: 'var(--color-gray-900)' }}>
            {value}
          </div>
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