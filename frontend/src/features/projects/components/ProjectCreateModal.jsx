import { useState } from 'react';
import { ColorPickerSwatch } from '@/components/ui';
import { useCreateProject } from '../hooks/useCreateProject';

/**
 * @component ProjectCreateModal
 * @description Modal dialog for creating a new project.
 * Uses useCreateProject hook for the API call, keeping business
 * logic out of the UI component.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onSuccess - Callback after project is created
 */
export function ProjectCreateModal({ isOpen, onClose, onSuccess }) {
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
      onSuccess(newProject);
      handleClose();
    } catch {
      // error is managed by the hook
    }
  };

  const handleClose = () => {
    setForm({ name: '', description: '', color: '#6B5CFF' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal d-block"
      role="dialog"
      aria-modal="true"
      aria-label="Create new project"
      title="Create new project"
      style={{ background: 'rgba(10,15,40,0.45)' }}
      onClick={e => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h6 fw-medium" id="project-create-modal-title">
              Create new project
            </h2>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              title="Close modal"
              aria-label="Close"
            />
          </div>
          <form onSubmit={handleSubmit} aria-label="New project form" noValidate>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger alert-sm py-2 text-sm mb-3" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="project-name" className="form-label" title="Project name">
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
                  title="Enter the project name"
                  aria-label="Project name"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="project-description" className="form-label" title="Project description">
                  Description
                </label>
                <textarea
                  id="project-description"
                  name="description"
                  className="form-control"
                  placeholder="What is this project about?"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  disabled={loading}
                  title="Enter a description for the project"
                  aria-label="Project description"
                />
              </div>

              <div className="mb-3">
                <ColorPickerSwatch
                  label="Project color"
                  value={form.color}
                  onChange={handleColorChange}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={loading}
                title="Cancel project creation"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !form.name.trim()}
                title="Create this project"
                aria-label="Create project"
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
  );
}