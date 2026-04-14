import { useParams, useNavigate } from 'react-router-dom';
import { BoardView } from '@/features/board/components/BoardView';
import { useBoard }  from '@/features/board/hooks/useBoard';

/**
 * @page BoardPage
 * @route /projects/:projectId/board
 * @description Kanban board page. Thin orchestrator — owns routing, delegates to BoardView.
 */
export default function BoardPage() {
  const { projectId } = useParams();
  const navigate       = useNavigate();
  const { columns, loading, error, moveTask } = useBoard(projectId);

  if (error) return (
    <div className="alert alert-danger" role="alert">{error}</div>
  );

  return (
    <div className="animate-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h5 fw-medium mb-0" title="Board">Board</h1>
        <button
          className="btn btn-primary btn-sm"
          title="Create a new task"
          aria-label="Create task"
        >
          + Task
        </button>
      </div>
      <BoardView
        columns={columns}
        loading={loading}
        onMoveTask={moveTask}
        onTaskClick={(id) => navigate(`/tasks/${id}`)}
      />
    </div>
  );
}
