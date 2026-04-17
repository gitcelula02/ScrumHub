import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '@/features/projects/hooks/useCreateProject';
import { ColorPickerSwatch } from '@/components/ui';

/**
 * @page ProjectCreatePage
 * @route /projects/new
 * @description Full-page view for creating a new project.
 * Includes project name, description, color, team members, and AI assistance options.
 */
export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const { createProject, loading, error } = useCreateProject();

  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#6B5CFF',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleColorChange = (hex) => {
    setForm(f => ({ ...f, color: hex }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      const newProject = await createProject(form);
      navigate(`/projects/${newProject.id}`);
    } catch {
      // error is managed by the hook
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  const handleAskAI = () => {
    // TODO: Implement AI assistance for project setup
    console.info('[ProjectCreate] Ask AI clicked');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <div className="mb-4">
                <button
                  className="btn btn-link text-secondary text-decoration-none p-0 mb-3"
                  onClick={handleCancel}
                  title="Back to projects"
                  aria-label="Back to projects"
                >
                  ← Back to projects
                </button>
                <h1 className="h3 fw-medium mb-1">Create new project</h1>
                <p className="text-secondary mb-0">
                  Set up your project workspace. You can add team members and configure settings after creation.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {error && (
                  <div className="alert alert-danger mb-4" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="project-name" className="form-label">
                    Project name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="project-name"
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. ScrumHub Web App"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="project-description" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="project-description"
                    name="description"
                    className="form-control"
                    placeholder="What is this project about? What's the main goal?"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    disabled={loading}
                  />
                </div>

                <div className="mb-4">
                  <ColorPickerSwatch
                    label="Project color"
                    value={form.color}
                    onChange={handleColorChange}
                  />
                  <div className="form-text">
                    Choose a color to identify your project across the workspace.
                  </div>
                </div>

                <hr className="my-4" />

                <div className="mb-4">
                  <h2 className="h6 fw-medium mb-3">Team members</h2>
                  <p className="text-secondary text-sm mb-3">
                    You can invite team members after creating the project.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    disabled={loading}
                    onClick={() => {/* TODO: invite members */}}
                  >
                    + Add members
                  </button>
                </div>

                <hr className="my-4" />

                <div className="mb-4">
                  <h2 className="h6 fw-medium mb-3">AI assistance</h2>
                  <p className="text-secondary text-sm mb-3">
                    Let AI help you plan your project. It can generate initial epics, backlogs, and more.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    disabled={loading}
                    onClick={handleAskAI}
                  >
                    ✦ Ask AI to help plan this project
                  </button>
                </div>

                <hr className="my-4" />

                <div className="d-flex gap-3 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !form.name.trim()}
                  >
                    {loading ? (
                      <span className="d-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        Creating…
                      </span>
                    ) : 'Create project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}