import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BoardView } from '@/features/board/components/BoardView';
import { useBoard } from '@/features/board/hooks/useBoard';
import { useSprints } from '@/features/sprints/hooks/useSprints';

const DEFAULT_BOARDS = [
  { id: 'todo', label: 'To Do', color: 'var(--color-gray-400)', icon: '○' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--color-brand-500)', icon: '◑' },
  { id: 'in_review', label: 'In Review', color: 'var(--color-warning)', icon: '◐' },
  { id: 'done', label: 'Done', color: 'var(--color-success)', icon: '●' },
  { id: 'blocked', label: 'Blocked', color: 'var(--color-danger)', icon: '✕' },
];

/**
 * @page BoardPage
 * @route /projects/:projectId/board
 * @description Kanban board page with sprint/user filtering and custom board management.
 */
export default function BoardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [customBoards] = useState(DEFAULT_BOARDS);

  const { sprints } = useSprints(projectId);
  const { columns, loading, error, moveTask } = useBoard(projectId, {
    sprintId: selectedSprintId,
    userIds: selectedUserIds,
    customBoards,
  });

  // Mock members for now - in real app this would come from a hook
  const members = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Johnson' },
  ];

  const handleCreateBoard = useCallback((boardData) => {
    console.info('[Board] Create board:', boardData);
  }, []);

  const handleUpdateBoard = useCallback((boardId, boardData) => {
    console.info('[Board] Update board:', boardId, boardData);
  }, []);

  const handleDeleteBoard = useCallback((boardId) => {
    console.info('[Board] Delete board:', boardId);
  }, []);

  if (error) return (
    <div className="alert alert-danger" role="alert">{error}</div>
  );

  return (
    <div className="animate-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h5 fw-medium mb-0">Board</h1>
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
        sprints={sprints}
        members={members}
        selectedSprintId={selectedSprintId}
        selectedUserIds={selectedUserIds}
        onSprintChange={setSelectedSprintId}
        onUserChange={setSelectedUserIds}
        onMoveTask={moveTask}
        onCreateBoard={handleCreateBoard}
        onUpdateBoard={handleUpdateBoard}
        onDeleteBoard={handleDeleteBoard}
        customBoards={customBoards}
        onTaskClick={(id) => navigate(`/tasks/${id}`)}
      />
    </div>
  );
}
