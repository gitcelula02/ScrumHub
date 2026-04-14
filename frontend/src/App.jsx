import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeRegistryProvider } from '@/store/ThemeRegistry';
import { AuthProvider } from '@/store/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import BacklogPage from '@/pages/BacklogPage';
import NotFound from '@/pages/NotFound';
import '@/styles/main.css';

/**
 * @component App
 * @description Root component. Declares providers and the route tree.
 *
 * Provider order (outermost → innermost):
 *   BrowserRouter → AuthProvider → ThemeRegistryProvider → routes
 *
 * ThemeRegistry must be inside Auth so feature hooks (which need auth)
 * can call registerEntities() freely after data fetches.
 *
 * ADDING ROUTES:
 * Authenticated routes go inside the AppShell element.
 * Public routes (login, register) go outside AppShell.
 * See AGENTS.md → "How to add a new view".
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeRegistryProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<div>Login page</div>} />
            <Route path="/register" element={<div>Register page</div>} />

            {/* Authenticated routes — wrapped in AppShell */}
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/projects" replace />} />
              <Route path="/projects/:projectId/backlog" element={<BacklogPage />} />
              {/* Add new pages here following the pattern in AGENTS.md */}
            </Route>
          </Routes>
        </ThemeRegistryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
