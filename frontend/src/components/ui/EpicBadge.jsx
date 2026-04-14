import { useEntityTheme } from '@/hooks/useEntityTheme';

/**
 * @component EpicBadge
 * @description Displays an epic's name as a colored pill badge.
 * The color derives entirely from `epic.color` via useEntityTheme —
 * this component contains zero color logic.
 *
 * Renders nothing if no epic is provided (safe to use in optional slots).
 *
 * @param {Object}  props
 * @param {Object}  props.epic              - Epic data object
 * @param {string}  props.epic.id           - Unique identifier
 * @param {string}  props.epic.name         - Display name
 * @param {string}  [props.epic.color]      - Hex color, e.g. "#3B6D11"
 * @param {boolean} [props.pill=false]      - Fully rounded pill shape
 * @param {boolean} [props.dot=true]        - Show color dot prefix
 * @param {string}  [props.className]       - Extra Bootstrap/utility classes
 * @param {Function}[props.onClick]         - Optional click handler
 *
 * @example <caption>In a backlog table row</caption>
 * <EpicBadge epic={task.epic} />
 *
 * @example <caption>Pill variant in kanban card</caption>
 * <EpicBadge epic={task.epic} pill />
 *
 * @example <caption>Clickable, no dot</caption>
 * <EpicBadge epic={epic} dot={false} onClick={() => openEpic(epic.id)} />
 */
export function EpicBadge({ epic, pill = false, dot = true, className = '', onClick }) {
  const theme = useEntityTheme(epic?.color);

  if (!epic) return null;

  return (
    <span
      className={`entity-badge ${pill ? 'entity-badge--pill' : ''} ${className}`}
      style={theme}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={epic.name}
    >
      {dot && (
        <span
          aria-hidden="true"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--entity-solid)',
            flexShrink: 0,
          }}
        />
      )}
      <span className="truncate" style={{ maxWidth: '120px' }}>
        {epic.name}
      </span>
    </span>
  );
}
