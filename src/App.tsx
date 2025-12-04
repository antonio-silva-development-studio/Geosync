import React from 'react'
import { useAppStore } from './store/useAppStore'
import { LoginScreen } from './components/LoginScreen'
import { Dashboard } from './components/Dashboard'

function App() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <Dashboard />;
}

export default App
