import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { ProjectCreateModal } from '@/features/projects/components/ProjectCreateModal';

/**
 * @page ProjectListPage
 * @route /projects
 * @description Shows all projects accessible to the user with options to create new project.
 * Serves as the default landing page after login.
 */
export default function ProjectListPage() {
  const { projects, loading, error, refetch } = useProjects();
  const [showModal, setShowModal] = useState(false);

  const handleProjectCreated = async () => {
    await refetch();
    setShowModal(false);
  };

if (loading) {
  return (
    <div className="container py-5">
      <div className="row">
        {[1, 2, 3].map(i => (
          <div key={i} className="col-md-4 mb-4">
            <div className="card border-0 shadow-sm placeholder-glow">
              <div className="card-body">
                <span className="placeholder col-6 rounded" style={{ height: '24px' }} />
                <span className="placeholder col-10 rounded mt-2" style={{ height: '16px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card border-0">
            <div className="card-body text-center py-5">
              <div
                className="mb-4"
                style={{ fontSize: '3rem', opacity: 0.4 }}
                aria-hidden="true"
              >
                ⚠
              </div>
              <h3 className="h5 fw-medium mb-2">Failed to load projects</h3>
              <p className="text-secondary mb-4">{error}</p>
              <button
                className="btn btn-primary"
                onClick={refetch}
                title="Retry loading projects"
                aria-label="Retry loading projects"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-medium mb-1">Your Projects</h1>
          <p className="text-secondary mb-0">
            Select a project to start planning, or create a new one.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          title="Create a new project"
          aria-label="Create new project"
        >
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>📁</div>
          <h3 className="h5 fw-medium mb-2">No projects yet</h3>
          <p className="text-secondary mb-4">
            Create your first project to start managing tasks and sprints.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            aria-label="Create your first project"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {projects.map(project => (
            <div key={project.id} className="col-md-6 col-lg-4">
              <Link
                to={`/projects/${project.id}`}
                className="card border-0 shadow-sm text-decoration-none project-card"
                title={`Open ${project.name}`}
                style={{ '--project-color': project.color || '#6B5CFF' }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-start mb-3">
                    <div
                      className="project-color-dot me-2"
                      style={{ backgroundColor: project.color || '#6B5CFF' }}
                      aria-hidden="true"
                    />
                    <div className="flex-grow-1">
                      <h3 className="h5 fw-medium mb-1">{project.name}</h3>
                      <p className="text-sm text-secondary mb-0 truncate-2">
                        {project.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between text-xs text-secondary">
                    <span>{project.members?.length || 0} members</span>
                    <span>{project.stats?.totalTasks || 0} tasks</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <ProjectCreateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
}