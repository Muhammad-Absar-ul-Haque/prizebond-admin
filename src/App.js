import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import { ToastProvider } from './context/ToastContext';

function PlaceholderPage({ title, icon }) {
  return (
    <div style={ps.wrap}>
      <div style={ps.icon}>{icon}</div>
      <div style={ps.title}>{title}</div>
      <div style={ps.sub}>This section is under construction and will be available soon.</div>
      <div style={ps.badge}>COMING SOON</div>
    </div>
  );
}

const ps = {
  wrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },
  icon: { fontSize: 48, marginBottom: 8 },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: '#1a2d47' },
  sub: { fontSize: 13, color: '#1a2d47', maxWidth: 300, textAlign: 'center', lineHeight: 1.6 },
  badge: { fontSize: 10, letterSpacing: 3, fontFamily: "'DM Mono', monospace", color: '#243d5c', background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 4, padding: '4px 10px', marginTop: 4 },
};

export default function App() {
  const [authed, setAuthed]         = useState(false);
  const [page, setPage]             = useState('users');
  const [pendingCount, setPending]  = useState(0);

  // Persist login across page refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setAuthed(true);
  }, []);

  const handleLogin  = () => setAuthed(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAuthed(false);
  };

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
