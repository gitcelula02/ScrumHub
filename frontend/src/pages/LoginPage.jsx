import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

/**
 * @page LoginPage
 * @route /login
 * @description Authenticated login form. Calls authService via AuthContext.
 * On success, redirects to /projects. Redirects to /projects if already authenticated.
 */
export default function LoginPage() {
  useAuthRedirect();

  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form);
      navigate('/projects', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
            <div className="auth-logo-mark" aria-hidden="true" />
            <span className="auth-logo-text">ScrumHub</span>
          </div>
          <h1 className="h5 fw-medium mb-1" style={{ color: 'var(--color-gray-900)' }}>
            Welcome back
          </h1>
          <p className="text-sm text-secondary">Sign in to continue to your workspace</p>
        </div>

        {error && (
          <div className="alert alert-danger alert-sm py-2 text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} aria-label="Login form" noValidate>
          <div className="mb-3">
            <label htmlFor="login-email" className="form-label" title="Your registered email address">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              className="form-control"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              autoFocus
              disabled={loading}
              title="Enter your email address"
              aria-label="Email address"
            />
          </div>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label htmlFor="login-password" className="form-label mb-0" title="Your account password">
                Password
              </label>
              <a href="#" className="text-xs text-brand" title="Reset your password">
                Forgot password?
              </a>
            </div>
            <input
              id="login-password"
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              disabled={loading}
              title="Enter your password"
              aria-label="Password"
            />
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            className="btn btn-primary w-100 mt-1"
            disabled={loading || !form.email || !form.password}
            title="Sign in to your account"
            aria-label="Sign in"
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                Signing in…
              </span>
            ) : 'Sign in'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-secondary mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand fw-medium" title="Create a new account">
              Sign up free
            </Link>
          </p>
        </div>

        <div className="auth-demo-hint" title="Demo credentials for testing">
          <span className="text-xs" style={{ color: 'var(--color-gray-400)' }}>
            Demo: <code>admin@proyecto.com</code> / <code>admin123</code>
          </span>
        </div>
      </div>
    </div>
  );
}