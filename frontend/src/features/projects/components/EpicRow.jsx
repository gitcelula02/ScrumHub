import { useEntityTheme } from '@/hooks/useEntityTheme';

/**
 * @component EpicRow
 * @description Single row in the epic breakdown table.
 * Uses useEntityTheme to apply the epic's color as CSS variables
 * on the left accent border and color dot.
 *
 * COLOR CONTRACT:
 * Sets --entity-bg, --entity-fg, --entity-border, --entity-solid for its subtree.
 *
 * @param {Object} props
 * @param {Object} props.epic - Epic record with tasks array
 * @param {string} props.epic.id
 * @param {string} props.epic.name
 * @param {string} props.epic.color - Hex color
 * @param {string} props.epic.status
 * @param {Object[]} props.epic.tasks
 */
export function EpicRow({ epic }) {
  const theme = useEntityTheme(epic.color);
  const total = epic.tasks?.length ?? 0;
  const done = epic.tasks?.filter(t => t.status === 'done').length ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <tr style={theme} title={epic.name}>
      <td>
        <div className="d-flex align-items-center gap-2">
          <span
            aria-hidden="true"
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--entity-solid)',
              flexShrink: 0,
            }}
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
              style={{ width: `${pct}%`, backgroundColor: 'var(--entity-solid)' }}
            />
          </div>
          <span className="text-xs text-secondary">{pct}%</span>
        </div>
      </td>
      <td>
        <span
          className={`badge ${
            epic.status === 'done' ? 'text-bg-success' :
            epic.status === 'in_progress' ? 'text-bg-primary' :
            'bg-secondary text-white'
          }`}
          title={`Status: ${epic.status ?? 'todo'}`}
        >
          {epic.status ?? 'todo'}
        </span>
      </td>
    </tr>
  );
}