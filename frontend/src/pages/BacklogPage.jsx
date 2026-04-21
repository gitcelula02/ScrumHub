import { useParams } from 'react-router-dom';
import { BacklogTable } from '@/features/backlog/components/BacklogTable';
import { useBacklog } from '@/features/backlog/hooks/useBacklog';

/**
 * @page BacklogPage
 * @route /projects/:projectId/backlog
 * @description Thin page component. Owns routing params and orchestrates
 * the backlog feature — no business logic lives here.
 *
 * Page components follow a strict rule: they may use hooks and compose
 * feature components, but contain zero rendering logic of their own.
 * If you find yourself writing JSX beyond a layout wrapper here,
 * it belongs in a feature component instead.
 */
export default function BacklogPage() {
  const { projectId } = useParams();
  const { epics, loading, error, is404 } = useBacklog(projectId);

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (is404) {
    return (
      <div className="animate-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h5 mb-0 fw-medium">Backlog</h1>
        </div>
        <div className="text-center py-5">
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }} aria-hidden="true">📋</div>
          <h2 className="h5 fw-medium mb-2">No backlog yet</h2>
          <p className="text-secondary mb-4">Create your first epic to start organizing tasks.</p>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-primary">+ New Epic</button>
            <button className="btn btn-outline-secondary">+ New Task</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h5 mb-0 fw-medium">Backlog</h1>
        <button className="btn btn-primary btn-sm">+ New Epic</button>
      </div>
      <BacklogTable epics={epics} loading={loading} />
    </div>
  );
}
