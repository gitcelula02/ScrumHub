import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeRegistryProvider } from '@/store/ThemeRegistry';
import { AuthProvider }          from '@/store/AuthContext';
import { AppShell }              from '@/components/layout/AppShell';

import LandingPage   from '@/pages/LandingPage';
import LoginPage     from '@/pages/LoginPage';
import RegisterPage  from '@/pages/RegisterPage';
import ProjectPage   from '@/pages/ProjectPage';
import BacklogPage   from '@/pages/BacklogPage';
import BoardPage     from '@/pages/BoardPage';
import SprintPage    from '@/pages/SprintPage';
import CalendarPage  from '@/pages/CalendarPage';
import ChatPage      from '@/pages/ChatPage';
import NotFound      from '@/pages/NotFound';

import '@/styles/main.css';

/**
 * @component App
 * @description Root component. Declares providers and the route tree.
 *
 * Provider order (outermost → innermost):
 *   BrowserRouter → AuthProvider → ThemeRegistryProvider → routes
 *
 * Route groups:
 *   Public  — LandingPage, LoginPage, RegisterPage (no AppShell)
 *   Private — everything inside AppShell (requires auth)
 *
 * See docs/AGENTS.md → "How to add a new view".
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeRegistryProvider>
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/"          element={<LandingPage />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />

            {/* ── Authenticated routes — wrapped in AppShell ── */}
            <Route element={<AppShell />}>
              {/* /projects → redirect to project list (sidebar shows projects) */}
              <Route path="/projects" element={<Navigate to="/" replace />} />

              {/* Project views */}
              <Route path="/projects/:projectId"           element={<ProjectPage />} />
              <Route path="/projects/:projectId/backlog"   element={<BacklogPage />} />
              <Route path="/projects/:projectId/board"     element={<BoardPage />} />
              <Route path="/projects/:projectId/sprints"   element={<SprintPage />} />
              <Route path="/projects/:projectId/calendar"  element={<CalendarPage />} />
              <Route path="/projects/:projectId/chat"      element={<ChatPage />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeRegistryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
