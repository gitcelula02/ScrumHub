import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';

/**
 * @page LandingPage
 * @route /
 * @description Public marketing landing page for unregistered users.
 * Redirects authenticated users directly to /projects.
 */
export default function LandingPage() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) navigate('/projects', { replace: true });
  }, [user, authLoading, navigate]);

  const features = [
    {
      icon: '📋',
      title: 'Smart Backlog',
      desc: 'Manage epics and tasks in a clean list view. Visualize dependencies with the built-in tree structure.',
    },
    {
      icon: '🗂️',
      title: 'Kanban Board',
      desc: 'Drag tasks across custom status columns. Every board is exportable as Markdown for AI context.',
    },
    {
      icon: '🚀',
      title: 'Sprint Planning',
      desc: 'Create time-boxed sprints, assign tasks from your backlog, and track progress with live metrics.',
    },
    {
      icon: '📅',
      title: 'Calendar View',
      desc: 'See all task and sprint deadlines at a glance. Create tasks directly from any date on the calendar.',
    },
    {
      icon: '💬',
      title: 'Team Chat + AI',
      desc: 'Unified project chat with built-in AI. Mention @AI to generate tasks, summaries, and reports.',
    },
    {
      icon: '📊',
      title: 'Live Statistics',
      desc: 'Sprint completion, task counts, and acceptance criteria tracked automatically as your team works.',
    },
  ];

  return (
    <div className="landing-page">
      {/* ── Nav ── */}
      <header className="landing-nav">
        <div className="container-xl d-flex align-items-center justify-content-between h-100">
          <div className="d-flex align-items-center gap-2" aria-label="ScrumHub home">
            <div className="landing-logo-mark" aria-hidden="true" />
            <span className="landing-logo-text">ScrumHub</span>
          </div>
          <nav className="d-flex align-items-center gap-3" aria-label="Main navigation">
            <a href="#features" className="landing-nav-link" title="View features">Features</a>
            <Link to="/login" className="btn btn-outline-primary btn-sm" title="Log in to your account">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm" title="Create a free account">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="landing-hero" aria-label="Hero section">
        <div className="container-xl text-center">
          <span className="landing-eyebrow" aria-label="Category badge">Scrum · AI · All in one place</span>
          <h1 className="landing-headline">
            Where great teams<br />
            <span className="landing-headline-accent">plan, build, ship.</span>
          </h1>
          <p className="landing-subheadline">
            ScrumHub replaces Jira with a smarter, AI-native project management platform.
            Beautiful boards, smart backlogs, and an AI assistant that actually understands your project.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link
              to="/register"
              className="btn btn-primary btn-lg px-4"
              title="Sign up for a free account"
            >
              Start for free →
            </Link>
            <a
              href="#features"
              className="btn btn-outline-secondary btn-lg px-4"
              title="Learn more about ScrumHub features"
            >
              See how it works
            </a>
          </div>

          {/* Hero mockup */}
          <div className="landing-hero-mockup" role="img" aria-label="ScrumHub interface preview" title="ScrumHub Kanban board preview">
            <div className="landing-mockup-bar">
              <span className="landing-mockup-dot" style={{ background: '#ef4444' }} />
              <span className="landing-mockup-dot" style={{ background: '#f59e0b' }} />
              <span className="landing-mockup-dot" style={{ background: '#22c55e' }} />
              <span className="ms-3 text-xs" style={{ color: 'var(--color-gray-400)' }}>scrumhub.app/projects/alpha/board</span>
            </div>
            <div className="landing-mockup-body">
              {['To Do', 'In Progress', 'In Review', 'Done'].map((col, i) => (
                <div key={col} className="landing-mockup-col">
                  <div className="landing-mockup-col-header">{col}</div>
                  {Array.from({ length: i === 1 ? 3 : i === 0 ? 2 : 1 }).map((_, j) => (
                    <div key={j} className="landing-mockup-card">
                      <div className="landing-mockup-card-bar" style={{
                        width: `${60 + Math.random() * 30}%`,
                        background: ['#6B5CFF','#f59e0b','#22c55e','#0ea5e9'][i % 4] + '33'
                      }} />
                      <div className="landing-mockup-card-bar" style={{ width: '45%', marginTop: '6px' }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-features" id="features" aria-label="Features section">
        <div className="container-xl">
          <h2 className="text-center fw-medium mb-2" style={{ color: 'var(--color-gray-900)', fontSize: '1.75rem' }}>
            Everything your team needs
          </h2>
          <p className="text-center text-secondary mb-5" style={{ maxWidth: '540px', margin: '0 auto 3rem' }}>
            From first idea to shipped feature — ScrumHub covers every phase of your Scrum workflow.
          </p>
          <div className="row g-4">
            {features.map(f => (
              <div key={f.title} className="col-md-6 col-lg-4">
                <div className="landing-feature-card" title={f.title}>
                  <div className="landing-feature-icon" aria-hidden="true">{f.icon}</div>
                  <h3 className="landing-feature-title">{f.title}</h3>
                  <p className="landing-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta" aria-label="Call to action">
        <div className="container-xl text-center">
          <h2 className="fw-medium mb-3" style={{ fontSize: '2rem' }}>Ready to ship faster?</h2>
          <p className="mb-4" style={{ opacity: 0.8, maxWidth: '480px', margin: '0 auto 2rem' }}>
            Join teams that replaced spreadsheets and legacy tools with a workspace that thinks with them.
          </p>
          <Link
            to="/register"
            className="btn btn-light btn-lg px-5"
            style={{ color: 'var(--color-brand-600)', fontWeight: 600 }}
            title="Create your free ScrumHub account"
          >
            Create free account
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer" aria-label="Site footer">
        <div className="container-xl d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <div className="landing-logo-mark" aria-hidden="true" style={{ width: '18px', height: '18px' }} />
            <span className="text-sm fw-medium" style={{ color: 'var(--color-gray-400)' }}>ScrumHub</span>
          </div>
          <p className="text-xs mb-0" style={{ color: 'var(--color-gray-400)' }}>
            © {new Date().getFullYear()} ScrumHub. Built for Scrum teams.
          </p>
          <nav className="d-flex gap-3" aria-label="Footer navigation">
            <Link to="/login"    className="text-xs" style={{ color: 'var(--color-gray-400)' }} title="Log in">Log in</Link>
            <Link to="/register" className="text-xs" style={{ color: 'var(--color-gray-400)' }} title="Sign up">Sign up</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
