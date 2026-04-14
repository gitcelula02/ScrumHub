import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';

/**
 * @page RegisterPage
 * @route /register
 * @description New user registration form.
 * On success, redirects to /projects.
 */
export default function RegisterPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError(null);
    try {
      // Register then immediately log in
      const { authService } = await import('@/features/auth/services/authService');
      await authService.register({ name: form.name, email: form.email, password: form.password });
      await login({ email: form.email, password: form.password });
      navigate('/projects', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        {/* Brand */}
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
            <div className="auth-logo-mark" aria-hidden="true" />
            <span className="auth-logo-text">ScrumHub</span>
          </div>
          <h1 className="h5 fw-medium mb-1" style={{ color: 'var(--color-gray-900)' }}>Create your account</h1>
          <p className="text-sm text-secondary">Start managing projects the smart way</p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger alert-sm py-2 text-sm" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} aria-label="Registration form" noValidate>
          <div className="mb-3">
            <label htmlFor="reg-name" className="form-label" title="Your full name">Full name</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              className="form-control"
              placeholder="Jane Smith"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
              disabled={loading}
              title="Enter your full name"
              aria-label="Full name"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="reg-email" className="form-label" title="Your email address">Email address</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              className="form-control"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
              title="Enter your email address"
              aria-label="Email address"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="reg-password" className="form-label" title="Choose a password">Password</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              className="form-control"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              disabled={loading}
              title="Choose a password (min 6 characters)"
              aria-label="Password"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="reg-confirm" className="form-label" title="Confirm your password">Confirm password</label>
            <input
              id="reg-confirm"
              type="password"
              name="confirm"
              className="form-control"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={handleChange}
              required
              autoComplete="new-password"
              disabled={loading}
              title="Repeat your password"
              aria-label="Confirm password"
            />
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            className="btn btn-primary w-100 mt-1"
            disabled={loading || !form.name || !form.email || !form.password || !form.confirm}
            title="Create your ScrumHub account"
            aria-label="Create account"
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                Creating account…
              </span>
            ) : 'Create account'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-secondary mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-brand fw-medium" title="Sign in to your account">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
