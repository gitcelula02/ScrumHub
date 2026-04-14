import { useState, useMemo, useCallback } from 'react';
import { StatusBadge } from '@/components/ui';

const DAYS    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS  = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

/**
 * @component CalendarView
 * @description Custom month-grid calendar displaying task due dates.
 * Clicking a date opens a quick-create task modal.
 *
 * @param {Object}   props
 * @param {Object}   props.tasksByDate  - { 'YYYY-MM-DD': Task[] }
 * @param {number}   props.year
 * @param {number}   props.month        - 0-indexed
 * @param {Function} props.onPrevMonth
 * @param {Function} props.onNextMonth
 * @param {boolean}  [props.loading]
 */
export function CalendarView({
  tasksByDate = {},
  year,
  month,
  onPrevMonth,
  onNextMonth,
  loading = false,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal]       = useState(false);

  const selectDate = useCallback((dateStr) => {
    setSelectedDate(dateStr);
    setShowModal(true);
  }, []);

  // Build the grid: days from prev month fill first row, then current, then padding
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = [];
    for (let i = 0; i < firstDay; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) grid.push(d);
    // Pad to complete the last row
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  }, [year, month]);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  if (loading) return <CalendarSkeleton />;

  return (
    <div className="animate-in" aria-label="Calendar view" title="Project calendar">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h1 className="h5 fw-medium mb-0" title="Calendar">Calendar</h1>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onPrevMonth}
            title="Previous month"
            aria-label="Go to previous month"
          >
            ‹
          </button>
          <span className="fw-medium text-sm px-2" title={`${MONTHS[month]} ${year}`} aria-live="polite">
            {MONTHS[month]} {year}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onNextMonth}
            title="Next month"
            aria-label="Go to next month"
          >
            ›
          </button>
          <button
            className="btn btn-sm btn-outline-primary ms-2"
            onClick={() => {
              setSelectedDate(todayKey);
              setShowModal(true);
            }}
            title="Add a new task to the calendar"
            aria-label="Add task"
          >
            + Task
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid" role="grid" aria-label={`Calendar for ${MONTHS[month]} ${year}`}>
        {/* Day headers */}
        {DAYS.map(d => (
          <div key={d} className="calendar-day-header" role="columnheader" aria-label={d} title={d}>{d}</div>
        ))}

        {/* Cells */}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="calendar-cell calendar-cell--empty" role="gridcell" aria-hidden="true" />;
          const key = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const tasks = tasksByDate[key] ?? [];
          const isToday = key === todayKey;
          return (
            <CalendarCell
              key={key}
              day={day}
              dateKey={key}
              tasks={tasks}
              isToday={isToday}
              onSelect={() => selectDate(key)}
            />
          );
        })}
      </div>

      {/* Task detail / create modal */}
      {showModal && (
        <CalendarModal
          dateKey={selectedDate}
          tasks={tasksByDate[selectedDate] ?? []}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

/* ── CalendarCell ───────────────────────────────────── */
function CalendarCell({ day, dateKey, tasks, isToday, onSelect }) {
  return (
    <div
      className={`calendar-cell ${isToday ? 'calendar-cell--today' : ''} ${tasks.length ? 'calendar-cell--has-tasks' : ''}`}
      onClick={onSelect}
      role="gridcell"
      tabIndex={0}
      title={`${dateKey}${tasks.length ? ` — ${tasks.length} task${tasks.length > 1 ? 's' : ''}` : ' — click to add task'}`}
      aria-label={`${dateKey}, ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
    >
      <span className={`calendar-day-num ${isToday ? 'calendar-day-num--today' : ''}`} aria-current={isToday ? 'date' : undefined}>
        {day}
      </span>
      <div className="calendar-task-chips">
        {tasks.slice(0, 3).map(task => (
          <div
            key={task.id}
            className="calendar-task-chip"
            title={`${task.title} — ${task.status}`}
            aria-label={task.title}
            style={{
              background: task.epic?.color
                ? task.epic.color + '33'
                : 'var(--color-brand-50)',
              borderLeft: `3px solid ${task.epic?.color ?? 'var(--color-brand-500)'}`,
            }}
          >
            <span className="truncate text-xs">{task.title}</span>
          </div>
        ))}
        {tasks.length > 3 && (
          <span className="text-xs text-secondary" title={`${tasks.length - 3} more tasks`} aria-label={`${tasks.length - 3} more`}>
            +{tasks.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}

/* ── CalendarModal ──────────────────────────────────── */
function CalendarModal({ dateKey, tasks, onClose }) {
  const [newTask, setNewTask] = useState('');
  const display = dateKey ? new Date(dateKey + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : '';

  return (
    <div
      className="modal d-block"
      role="dialog"
      aria-modal="true"
      aria-label={`Tasks for ${display}`}
      title={`Tasks for ${display}`}
      style={{ background: 'rgba(10,15,40,0.45)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h6 fw-medium" id="calendar-modal-title" title={display}>
              {display}
            </h2>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              title="Close modal"
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            {/* Existing tasks */}
            {tasks.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-secondary fw-medium mb-2 text-uppercase" style={{ letterSpacing: '0.06em' }} title="Tasks due on this date">
                  Due this day
                </p>
                <div className="d-flex flex-column gap-2">
                  {tasks.map(task => (
                    <div key={task.id} className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'var(--color-gray-50)' }} title={task.title}>
                      <StatusBadge status={task.status} />
                      <span className="text-sm flex-grow-1 truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick create */}
            <div>
              <label htmlFor="cal-new-task" className="form-label" title="New task title">
                Add task on {display}
              </label>
              <div className="d-flex gap-2">
                <input
                  id="cal-new-task"
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Task title…"
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  title="Enter the title of the new task"
                  aria-label="New task title"
                  autoFocus
                />
                <button
                  className="btn btn-primary btn-sm"
                  disabled={!newTask.trim()}
                  title="Create this task"
                  aria-label="Create task"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="calendar-grid" aria-busy="true" aria-label="Loading calendar">
      {DAYS.map(d => (
        <div key={d} className="calendar-day-header">{d}</div>
      ))}
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="calendar-cell placeholder-glow">
          <span className="placeholder" style={{ width: '20px', height: '20px', borderRadius: '50%', display: 'block' }} />
        </div>
      ))}
    </div>
  );
}
