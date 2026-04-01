import React, { useState, useEffect, useCallback } from 'react';
import { users as usersService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Topbar from '../components/Topbar';
import StatusBadge from '../components/StatusBadge';
import UserDetailPanel from '../components/UserDetailPanel';
import ConfirmModal from '../components/ConfirmModal';

const FILTERS = ['ALL', 'PENDING', 'ACTIVE', 'REJECTED'];

export default function UserManagement({ onStatsUpdate }) {
  const { show } = useToast();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirm, setConfirm] = useState(null); // { userId, status, userName }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersService.listAll();
      setUsers(data);
      onStatsUpdate && onStatsUpdate(data);
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') return;
      show(err.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    let result = users;
    if (activeFilter !== 'ALL') result = result.filter((u) => u.status === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [users, activeFilter, search]);

  const counts = {
    ALL: users.length,
    PENDING: users.filter((u) => u.status === 'PENDING').length,
    ACTIVE: users.filter((u) => u.status === 'ACTIVE').length,
    REJECTED: users.filter((u) => u.status === 'REJECTED').length,
  };

  const handleConfirmAction = async () => {
    if (!confirm) return;
    setActionLoading(confirm.status);
    try {
      await usersService.updateStatus(confirm.userId, confirm.status);
      setUsers((prev) => prev.map((u) => u.id === confirm.userId ? { ...u, status: confirm.status } : u));
      if (selectedUser?.id === confirm.userId) {
        setSelectedUser((prev) => ({ ...prev, status: confirm.status }));
      }
      show(
        confirm.status === 'ACTIVE'
          ? `${confirm.userName} has been approved ✓`
          : `${confirm.userName} has been rejected`,
        confirm.status === 'ACTIVE' ? 'success' : 'error'
      );
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') return;
      show(err.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };


  const openApprove = (user, e) => {
    e?.stopPropagation();
    setConfirm({ userId: user.id, status: 'ACTIVE', userName: `${user.firstName} ${user.lastName}` });
  };

  const openReject = (user, e) => {
    e?.stopPropagation();
    setConfirm({ userId: user.id, status: 'REJECTED', userName: `${user.firstName} ${user.lastName}` });
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  const initials = (u) => `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();

  return (
    <div style={s.page}>
      <Topbar title="User Management" breadcrumb="Admin → Users" />

      <div style={s.content}>
        {/* Stats bar */}
        <div style={s.statsRow}>
          {[
            { label: 'Total Users', value: counts.ALL,     color: '#e8b84b', icon: '◈' },
            { label: 'Pending',     value: counts.PENDING, color: '#fbbf24', icon: '◎' },
            { label: 'Active',      value: counts.ACTIVE,  color: '#4ade80', icon: '◉' },
            { label: 'Rejected',    value: counts.REJECTED,color: '#f87171', icon: '✕' },
          ].map(({ label, value, color, icon }) => (
            <div key={label} style={s.statCard}>
              <div style={{ ...s.statIcon, color }}>{icon}</div>
              <div>
                <div style={s.statLabel}>{label}</div>
                <div style={{ ...s.statValue, color }}>{loading ? '—' : value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.filterTabs}>
            {FILTERS.map((f) => (
              <button
                key={f}
                style={{ ...s.filterTab, ...(activeFilter === f ? s.filterTabActive : {}) }}
                onClick={() => setActiveFilter(f)}
              >
                {f}
                <span style={{ ...s.filterCount, ...(activeFilter === f ? s.filterCountActive : {}) }}>
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>⌕</span>
            <input
              style={s.searchInput}
              placeholder="Search name, email, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button style={s.clearBtn} onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <button style={s.refreshBtn} onClick={fetchUsers}>↻ Refresh</button>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.theadRow}>
                {['User', 'Contact', 'City', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} style={{ ...s.th, ...(h === 'Actions' ? s.thRight : {}) }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={s.skeletonRow}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={s.td}><div style={s.skeleton} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={s.emptyCell}>
                    <div style={s.empty}>
                      <div style={s.emptyIcon}>◈</div>
                      <div style={s.emptyText}>No users found</div>
                      <div style={s.emptySub}>Try adjusting your filters or search query</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <tr
                    key={user.id}
                    style={{ ...s.tr, animationDelay: `${i * 30}ms` }}
                    onClick={() => setSelectedUser(user)}
                  >
                    {/* User */}
                    <td style={s.td}>
                      <div style={s.userCell}>
                        <div style={s.avatar}>{initials(user)}</div>
                        <div>
                          <div style={s.userName}>{user.firstName} {user.lastName}</div>
                          <div style={s.userId}>#{user.id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td style={s.td}>
                      <div style={s.email}>{user.email}</div>
                      <div style={s.mobile}>{user.mobile}</div>
                    </td>
                    {/* City */}
                    <td style={s.td}>
                      <span style={s.cityBadge}>{user.city}</span>
                    </td>
                    {/* Status */}
                    <td style={s.td}><StatusBadge status={user.status} /></td>
                    {/* Joined */}
                    <td style={s.td}><span style={s.dateText}>{formatDate(user.createdAt)}</span></td>
                    {/* Actions */}
                    <td style={{ ...s.td, ...s.actionCell }} onClick={(e) => e.stopPropagation()}>
                      {user.status === 'PENDING' ? (
                        <div style={s.actionBtns}>
                          <button style={s.approveBtn} onClick={(e) => openApprove(user, e)} title="Approve">
                            ✓ Approve
                          </button>
                          <button style={s.rejectBtn} onClick={(e) => openReject(user, e)} title="Reject">
                            ✕ Reject
                          </button>
                        </div>
                      ) : (
                        <div style={s.actionBtns}>
                          {user.status === 'ACTIVE' && (
                            <button style={s.rejectBtn} onClick={(e) => openReject(user, e)}>✕ Revoke</button>
                          )}
                          {user.status === 'REJECTED' && (
                            <button style={s.approveBtn} onClick={(e) => openApprove(user, e)}>✓ Re-approve</button>
                          )}
                          <button style={s.viewBtn} onClick={() => setSelectedUser(user)}>View</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={s.tableFooter}>
          Showing <strong style={{ color: '#e2eaf5' }}>{filtered.length}</strong> of <strong style={{ color: '#e2eaf5' }}>{users.length}</strong> users
        </div>
      </div>

      {/* Detail Panel */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onApprove={(id) => openApprove(users.find((u) => u.id === id))}
          onReject={(id) => openReject(users.find((u) => u.id === id))}
          actionLoading={actionLoading}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirmAction}
        loading={!!actionLoading}
        type={confirm?.status === 'ACTIVE' ? 'success' : 'danger'}
        title={confirm?.status === 'ACTIVE' ? 'Approve User?' : 'Reject User?'}
        message={
          confirm?.status === 'ACTIVE'
            ? `Are you sure you want to approve ${confirm?.userName}? They will receive an email and can login to the app.`
            : `Are you sure you want to reject ${confirm?.userName}? They will be notified via email.`
        }
        confirmLabel={confirm?.status === 'ACTIVE' ? 'Yes, Approve' : 'Yes, Reject'}
      />
    </div>
  );
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  content: { flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 },
  statCard: {
    background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 10,
    padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
    transition: 'border-color 0.2s',
  },
  statIcon: { fontSize: 22, flexShrink: 0 },
  statLabel: { fontSize: 11, color: '#304d68', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: "'DM Mono', monospace" },
  statValue: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, lineHeight: 1.1, marginTop: 2 },

  toolbar: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  filterTabs: { display: 'flex', gap: 4, background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 8, padding: 4 },
  filterTab: {
    padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
    background: 'transparent', color: '#6a8fad', fontSize: 12, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 7,
    transition: 'all 0.15s',
  },
  filterTabActive: { background: '#152035', color: '#e2eaf5' },
  filterCount: { fontSize: 10, background: '#101828', color: '#304d68', borderRadius: 10, padding: '1px 6px', fontFamily: "'DM Mono', monospace" },
  filterCountActive: { background: 'rgba(200,150,12,0.15)', color: '#e8b84b' },

  searchWrap: {
    flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8,
    background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 8,
    padding: '0 12px', height: 36,
  },
  searchIcon: { color: '#304d68', fontSize: 16 },
  searchInput: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    color: '#e2eaf5', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
  },
  clearBtn: { background: 'none', border: 'none', color: '#304d68', cursor: 'pointer', fontSize: 11, padding: 2 },
  refreshBtn: {
    padding: '7px 14px', borderRadius: 8,
    background: '#101828', border: '1px solid #1a2d47',
    color: '#6a8fad', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s', whiteSpace: 'nowrap',
  },

  tableWrap: { background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { background: '#07090f', borderBottom: '1px solid #1a2d47' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: 10, fontWeight: 600, color: '#304d68',
    textTransform: 'uppercase', letterSpacing: 1.5,
    fontFamily: "'DM Mono', monospace",
  },
  thRight: { textAlign: 'right' },
  tr: {
    borderBottom: '1px solid rgba(26,45,71,0.5)',
    cursor: 'pointer', transition: 'background 0.12s',
    animation: 'fadeIn 0.3s ease both',
  },
  td: { padding: '13px 16px', verticalAlign: 'middle' },
  actionCell: { textAlign: 'right' },

  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(200,150,12,0.1)', border: '1px solid rgba(200,150,12,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 12, color: '#e8b84b',
  },
  userName: { fontSize: 13.5, fontWeight: 600, color: '#e2eaf5' },
  userId: { fontSize: 10, color: '#304d68', fontFamily: "'DM Mono', monospace", marginTop: 2 },
  email: { fontSize: 12.5, color: '#6a8fad' },
  mobile: { fontSize: 11, color: '#304d68', fontFamily: "'DM Mono', monospace", marginTop: 2 },
  cityBadge: {
    fontSize: 11, background: '#101828', border: '1px solid #1a2d47',
    borderRadius: 6, padding: '3px 9px', color: '#6a8fad',
    fontFamily: "'DM Mono', monospace",
  },
  dateText: { fontSize: 11.5, color: '#6a8fad', fontFamily: "'DM Mono', monospace" },

  actionBtns: { display: 'flex', gap: 6, justifyContent: 'flex-end' },
  approveBtn: {
    padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)',
    background: 'rgba(34,197,94,0.08)', color: '#4ade80',
    fontSize: 11, fontWeight: 700, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
  },
  rejectBtn: {
    padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(239,68,68,0.08)', color: '#f87171',
    fontSize: 11, fontWeight: 700, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
  },
  viewBtn: {
    padding: '5px 12px', borderRadius: 6, border: '1px solid #1a2d47',
    background: '#101828', color: '#6a8fad',
    fontSize: 11, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },

  skeletonRow: { borderBottom: '1px solid rgba(26,45,71,0.4)' },
  skeleton: {
    height: 12, borderRadius: 4,
    background: 'linear-gradient(90deg, #101828 25%, #152035 50%, #101828 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  },

  emptyCell: { padding: '60px 20px' },
  empty: { textAlign: 'center' },
  emptyIcon: { fontSize: 32, color: '#1a2d47', marginBottom: 12 },
  emptyText: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: '#304d68' },
  emptySub: { fontSize: 12.5, color: '#1a2d47', marginTop: 6 },

  tableFooter: { fontSize: 12, color: '#304d68', padding: '4px 0', fontFamily: "'DM Mono', monospace" },
};
