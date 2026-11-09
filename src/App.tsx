import { App as AntApp, ConfigProvider, theme as antdTheme } from 'antd';
import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { setGlobalErrorHandler } from './api/client';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { TasksProvider } from './context/TasksContext';
import { ThemeProvider, useThemeMode } from './context/ThemeContext';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import MyTasksPage from './pages/MyTasksPage';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';

/** Shows API errors (403 / 5xx / network) as toasts. */
function GlobalErrorToasts() {
  const { message } = AntApp.useApp();
  useEffect(() => {
    setGlobalErrorHandler((msg) => message.error({ content: msg, key: 'api-error' }));
  }, [message]);
  return null;
}

function Themed() {
  const { mode } = useThemeMode();
  return (
    <ConfigProvider
      theme={{
        algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 10,
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        components: { Layout: { headerBg: 'transparent', bodyBg: 'transparent' } },
      }}
    >
      <AntApp>
        <GlobalErrorToasts />
        <AuthProvider>
          <TasksProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="my-tasks" element={<MyTasksPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                </Route>
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </TasksProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Themed />
    </ThemeProvider>
  );
}
