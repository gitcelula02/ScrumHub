import { useEntityTheme } from '@/hooks/useEntityTheme';

/**
 * @component SprintPill
 * @description Displays a sprint name as a rounded pill with its team color.
 * Identical color contract to EpicBadge — driven by useEntityTheme.
 *
 * @param {Object}  props
 * @param {Object}  props.sprint            - Sprint data object
 * @param {string}  props.sprint.id
 * @param {string}  props.sprint.name
 * @param {string}  [props.sprint.color]    - Hex color
 * @param {boolean} [props.showStatus=false]- Show active/planned/done status dot
 * @param {string}  [props.className]
 *
 * @example
 * <SprintPill sprint={currentSprint} showStatus />
 */
export function SprintPill({ sprint, showStatus = false, className = '' }) {
  const theme = useEntityTheme(sprint?.color);

  if (!sprint) return null;

  const statusColors = {
    active:  '#22c55e',
    planned: '#f59e0b',
    done:    '#94a3b8',
  };

  return (
    <span
      className={`entity-badge entity-badge--pill ${className}`}
      style={theme}
      title={sprint.name}
    >
      {showStatus && sprint.status && (
        <span
          aria-label={sprint.status}
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: statusColors[sprint.status] ?? statusColors.planned,
            flexShrink: 0,
          }}
        />
      )}
      {sprint.name}
    </span>
  );
}
