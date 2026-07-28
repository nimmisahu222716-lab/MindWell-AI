import React, { useContext, useState } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';

function DashboardOrAuth() {
  const { token, loading } = useContext(AuthContext);
  const [authMode, setAuthMode] = useState(null);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        transition: 'background-color var(--transition-speed)'
      }}>
        <div className="spinner-mindwell"></div>
        <p style={{ marginTop: 16, fontSize: '1.1rem', fontWeight: 500, opacity: 0.8 }}>
          Restoring your calm space...
        </p>
      </div>
    );
  }

  if (token) {
    return <DashboardPage />;
  }

  if (authMode) {
    return (
      <AuthPage 
        initialMode={authMode} 
        onBackHome={() => setAuthMode(null)} 
      />
    );
  }

  return <HomePage onOpenAuth={(mode) => setAuthMode(mode)} />;
}

function App() {
  return (
    <AuthProvider>
      <DashboardOrAuth />
    </AuthProvider>
  );
}

export default App;
