import { useParams } from 'react-router-dom';
import { CalendarView } from '@/features/calendar/components/CalendarView';
import { useCalendar }  from '@/features/calendar/hooks/useCalendar';

/**
 * @page CalendarPage
 * @route /projects/:projectId/calendar
 * @description Calendar view page. Thin orchestrator — delegates all rendering to CalendarView.
 */
export default function CalendarPage() {
  const { projectId } = useParams();
  const { tasksByDate, year, month, prevMonth, nextMonth, loading, error } = useCalendar(projectId);

  if (error) return (
    <div className="alert alert-danger" role="alert">{error}</div>
  );

  return (
    <CalendarView
      tasksByDate={tasksByDate}
      year={year}
      month={month}
      onPrevMonth={prevMonth}
      onNextMonth={nextMonth}
      loading={loading}
    />
  );
}
