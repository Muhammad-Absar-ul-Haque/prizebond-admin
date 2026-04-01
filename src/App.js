import React, { useState, useEffect } from 'react';
import { auth } from './services/api';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './context/ToastContext';


function LoadingPage() {
  return (
    <div style={ps.loadingWrap}>
      <div style={ps.spinner} />
      <div style={ps.loadingTitle}>Authenticating...</div>
      <div style={ps.loadingSub}>Establishing secure connection to admin console.</div>
    </div>
  );
}

function PlaceholderPage({ title, icon }) {
  return (
    <div style={ps.placeholderWrap}>
      <div style={ps.placeholderIcon}>{icon}</div>
      <div style={ps.placeholderTitle}>{title}</div>
      <div style={ps.placeholderText}>This section is under construction and will be available soon.</div>
      <div style={ps.placeholderBadge}>COMING SOON</div>
    </div>
  );
}

const ps = {
  loadingWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, height: '100vh', background: '#07090f' },
  spinner: { width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(232,184,75,0.1)', borderTopColor: '#e8b84b', animation: 'spin 1s linear infinite' },
  loadingTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24, color: '#e8b84b', letterSpacing: 1 },
  loadingSub: { fontSize: 13, color: '#304d68', fontFamily: "'DM Mono', monospace", letterSpacing: 0.5 },

  placeholderWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },
  placeholderIcon: { fontSize: 48, marginBottom: 8 },
  placeholderTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: '#1a2d47' },
  placeholderText: { fontSize: 13, color: '#1a2d47', maxWidth: 300, textAlign: 'center', lineHeight: 1.6 },
  placeholderBadge: { fontSize: 10, letterSpacing: 3, fontFamily: "'DM Mono', monospace", color: '#243d5c', background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 4, padding: '4px 10px', marginTop: 4 },
};

export default function App() {
  const [authed, setAuthed]         = useState(false);
  const [initialized, setInit]      = useState(false);
  const [page, setPage]             = useState('users');
  const [pendingCount, setPending]  = useState(0);

  // Global handler for session issues
  useEffect(() => {
    const handleReauth = (e) => {
      if (e.reason && e.reason.message === 'AUTH_EXPIRED') {
        handleLogout();
      }
    };
    window.addEventListener('unhandledrejection', handleReauth);
    return () => window.removeEventListener('unhandledrejection', handleReauth);
  }, []);

  // Persist login across page refresh & verify session
  useEffect(() => {
    const checkAuth = async () => {
      let token = localStorage.getItem('token');
      
      // Strict check for invalid token values on start
      if (!token || token === 'undefined' || token === 'null') {
        localStorage.removeItem('token');
        setInit(true);
        return;
      }

      try {
        await auth.getMe();
        setAuthed(true);
      } catch (err) {
        console.error('Session expired or invalid:', err.message);
        handleLogout();
      } finally {
        setInit(true);
      }
    };
    checkAuth();
  }, []);

  const handleLogin  = () => setAuthed(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAuthed(false);
  };

  if (!initialized) {
    return <LoadingPage />;
  }

  if (!authed) {
    return (
      <ToastProvider>
        <Login onLogin={handleLogin} />
      </ToastProvider>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'users': return <UserManagement onStatsUpdate={(u) => setPending(u.filter((x) => x.status === 'PENDING').length)} />;
      default:      return <PlaceholderPage title="Coming Soon" icon="◈" />;
    }
  };

  return (
    <ToastProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#07090f' }}>
        <Sidebar activePage={page} onNavigate={setPage} pendingCount={pendingCount} onLogout={handleLogout} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {renderPage()}
        </main>
      </div>
    </ToastProvider>
  );
}
