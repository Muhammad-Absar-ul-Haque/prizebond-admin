import React from 'react';

const NAV = [
  { section: 'MAIN' },
  { id: 'dashboard', icon: '⬡', label: 'Dashboard',       disabled: true,  soon: true  },
  { id: 'users',     icon: '◈', label: 'User Management', disabled: false               },
  { section: 'BONDS' },
  { id: 'bonds',     icon: '◉', label: 'Prize Bonds',     disabled: true,  soon: true  },
  { id: 'draws',     icon: '◎', label: 'Draw Results',    disabled: true,  soon: true  },
  { id: 'winners',   icon: '★', label: 'Winners',         disabled: true,  soon: true  },
  { section: 'SYSTEM' },
  { id: 'analytics', icon: '▣', label: 'Analytics',       disabled: true,  soon: true  },
  { id: 'settings',  icon: '◈', label: 'Settings',        disabled: true,  soon: true  },
];

export default function Sidebar({ activePage, onNavigate, pendingCount, onLogout }) {
  const adminData = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}'); } catch { return {}; }
  })();

  return (
    <aside style={s.sidebar}>
      {/* Logo */}
      <div style={s.logo}>
        <div style={s.logoMark}>🏆</div>
        <div>
          <div style={s.logoName}>PrizeBond PK</div>
          <div style={s.logoSub}>ADMIN CONSOLE</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        {NAV.map((item, i) => {
          if (item.section) return <div key={i} style={s.sectionLabel}>{item.section}</div>;
          const isActive = item.id === activePage;
          return (
            <div
              key={item.id}
              style={{ ...s.navItem, ...(isActive ? s.navActive : {}), ...(item.disabled ? s.navDisabled : {}) }}
              onClick={() => !item.disabled && onNavigate(item.id)}
            >
              <span style={{ ...s.navIcon, ...(isActive ? s.navIconActive : {}) }}>{item.icon}</span>
              <span style={s.navLabel}>{item.label}</span>
              {item.id === 'users' && pendingCount > 0 && (
                <span style={s.badge}>{pendingCount}</span>
              )}
              {item.soon && <span style={s.soon}>SOON</span>}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.adminAvatar}>A</div>
        <div style={s.adminInfo}>
          <div style={s.adminName}>{adminData.name || 'Super Admin'}</div>
          <div style={s.adminRole}>ADMINISTRATOR</div>
        </div>
        <button style={s.logoutBtn} onClick={onLogout} title="Sign out">⏻</button>
      </div>
    </aside>
  );
}

const s = {
  sidebar: { width: 248, minWidth: 248, background: '#0b1120', borderRight: '1px solid #1a2d47', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  logo: { padding: '22px 20px', borderBottom: '1px solid #1a2d47', display: 'flex', alignItems: 'center', gap: 12 },
  logoMark: { fontSize: 28 },
  logoName: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#e8b84b', letterSpacing: 1 },
  logoSub: { fontSize: 9, color: '#304d68', letterSpacing: 3, fontFamily: "'DM Mono', monospace", marginTop: 2 },
  nav: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  sectionLabel: { fontSize: 9, fontWeight: 600, letterSpacing: 2.5, color: '#304d68', textTransform: 'uppercase', padding: '16px 20px 6px', fontFamily: "'DM Mono', monospace" },
  navItem: { display: 'flex', alignItems: 'center', gap: 11, padding: '10px 20px', cursor: 'pointer', color: '#6a8fad', fontWeight: 500, fontSize: 13.5, transition: 'all 0.15s', userSelect: 'none', borderRight: '2px solid transparent' },
  navActive: { background: 'rgba(200,150,12,0.1)', color: '#e8b84b', borderRight: '2px solid #c8960c' },
  navDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  navIcon: { fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 },
  navIconActive: { color: '#c8960c' },
  navLabel: { flex: 1 },
  badge: { fontSize: 10, background: 'rgba(200,150,12,0.15)', color: '#e8b84b', border: '1px solid rgba(200,150,12,0.4)', borderRadius: 20, padding: '1px 7px', fontFamily: "'DM Mono', monospace", fontWeight: 600 },
  soon: { fontSize: 8, background: '#101828', color: '#304d68', borderRadius: 4, padding: '2px 6px', fontFamily: "'DM Mono', monospace", border: '1px solid #1a2d47' },
  footer: { padding: '14px 20px', borderTop: '1px solid #1a2d47', display: 'flex', alignItems: 'center', gap: 10 },
  adminAvatar: { width: 32, height: 32, borderRadius: '50%', background: 'rgba(200,150,12,0.12)', border: '1px solid rgba(200,150,12,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: '#e8b84b', flexShrink: 0 },
  adminInfo: { flex: 1, minWidth: 0 },
  adminName: { fontSize: 13, fontWeight: 600, color: '#e2eaf5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  adminRole: { fontSize: 9, color: '#304d68', fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, marginTop: 2 },
  logoutBtn: { width: 28, height: 28, borderRadius: 6, border: '1px solid #1a2d47', background: '#101828', color: '#6a8fad', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' },
};
