import React from 'react';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginContainer } from './modules/auth/LoginContainer';
import { useAuthStore } from './modules/auth/store';
import { Dashboard } from './modules/layout/Dashboard';
import { useAppStore } from './store/useAppStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const theme = useAppStore((state) => state.theme);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginContainer />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Toaster position="top-right" richColors />
      <Dashboard />
    </ErrorBoundary>
  );
}

export default App;
