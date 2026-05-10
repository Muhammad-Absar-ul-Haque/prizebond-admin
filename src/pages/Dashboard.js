import React, { useState, useEffect } from 'react';
import { dashboard, users } from '../services/api';
import { useToast } from '../context/ToastContext';
import Topbar from '../components/Topbar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const COLORS = ['#e8b84b', '#4ade80', '#fbbf24', '#f87171', '#60a5fa', '#c084fc'];

export default function Dashboard({ onNavigate }) {
  const { show } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await dashboard.getStats();
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') return;
      show(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveUser = async (userId) => {
    setActionLoading(userId);
    try {
      await users.updateStatus(userId, 'ACTIVE');
      show('User approved successfully', 'success');
      // Refresh dashboard
      fetchDashboardData();
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') return;
      show(err.message || 'Failed to approve user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const renderKPIs = () => {
    if (!data?.kpi) return null;
    const { kpi } = data;
    const cards = [
      { label: 'Total Users', value: kpi.totalActiveUsers || 0, color: '#4ade80', icon: '◈' },
      { label: 'Bonds Registered', value: kpi.totalBondsRegistered || 0, color: '#60a5fa', icon: '◉' },
      { label: 'Total Winners', value: kpi.totalWinners || 0, color: '#e8b84b', icon: '🏆' },
      { label: 'Marketplace Listings', value: kpi.activeMarketplaceListings || 0, color: '#fb923c', icon: '🛒' },
    ];

    return (
      <div style={s.kpiRow}>
        {cards.map((card, i) => (
          <div key={i} style={s.kpiCard}>
            <div style={{ ...s.kpiIcon, color: card.color }}>{card.icon}</div>
            <div style={s.kpiContent}>
              <div style={s.kpiLabel}>{card.label}</div>
              <div style={{ ...s.kpiValue, color: card.color }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderActionRequired = () => {
    if (!data?.actionRequired) return null;
    const { pendingUsers, drawsMissingResults } = data.actionRequired;
    const hasActions = (pendingUsers && pendingUsers.length > 0) || (drawsMissingResults && drawsMissingResults.length > 0);

    if (!hasActions) return null;

    return (
      <div style={s.sectionCard}>
        <h3 style={s.sectionTitle}>Action Required</h3>
        
        {pendingUsers && pendingUsers.length > 0 && (
          <div style={s.alertBox}>
            <div style={s.alertHeader}>
              <span style={{ color: '#fbbf24', marginRight: 8 }}>⚠️</span>
              Users Awaiting Approval
            </div>
            <div style={s.actionList}>
              {pendingUsers.map(u => (
                <div key={u.id} style={s.actionItem}>
                  <div>
                    <div style={s.actionItemTitle}>{u.firstName} {u.lastName}</div>
                    <div style={s.actionItemSub}>{u.email}</div>
                  </div>
                  <button 
                    style={s.approveBtn} 
                    onClick={() => handleApproveUser(u.id)}
                    disabled={actionLoading === u.id}
                  >
                    {actionLoading === u.id ? '...' : '✓ Approve'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {drawsMissingResults && drawsMissingResults.length > 0 && (
          <div style={{ ...s.alertBox, borderLeftColor: '#f87171' }}>
            <div style={s.alertHeader}>
              <span style={{ color: '#f87171', marginRight: 8 }}>⚠️</span>
              Draws Missing Results
            </div>
            <div style={s.actionList}>
              {drawsMissingResults.map(d => (
                <div key={d.id} style={s.actionItem}>
                  <div>
                    <div style={s.actionItemTitle}>{d.drawNumber} ({d.denomination})</div>
                    <div style={s.actionItemSub}>{new Date(d.date).toLocaleDateString()} - {d.city}</div>
                  </div>
                  <button style={s.uploadBtn} onClick={() => onNavigate('draws')}>
                    Upload PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCharts = () => {
    if (!data?.charts?.bondsByDenomination) return null;
    const chartData = data.charts.bondsByDenomination.map(item => ({
      name: `Rs. ${item.denomination}`,
      value: item.count
    }));

    return (
      <div style={s.sectionCard}>
        <h3 style={s.sectionTitle}>Bonds by Denomination</h3>
        <div style={s.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0b1120', border: '1px solid #1a2d47', borderRadius: '8px' }}
                itemStyle={{ color: '#e2eaf5' }}
              />
              <Legend wrapperStyle={{ color: '#6a8fad', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderRecentActivity = () => {
    if (!data?.recentActivity) return null;
    const { recentWinners, latestSales } = data.recentActivity;

    return (
      <div style={s.sectionCard}>
        <h3 style={s.sectionTitle}>Recent Activity</h3>
        
        <div style={s.activitySection}>
          <h4 style={s.activitySubTitle}>Recent Winners</h4>
          {recentWinners && recentWinners.length > 0 ? (
            <div style={s.activityList}>
              {recentWinners.map((w, i) => (
                <div key={i} style={s.activityItem}>
                  <div style={s.activityDot} />
                  <div style={s.activityText}>
                    <strong style={s.highlight}>{w.user?.firstName} {w.user?.lastName}</strong> won on bond <strong style={s.highlight}>{w.serial}</strong> ({w.denomination})
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={s.emptyActivity}>No recent winners</div>
          )}
        </div>

        <div style={s.activitySection}>
          <h4 style={s.activitySubTitle}>Latest Marketplace Sales</h4>
          {latestSales && latestSales.length > 0 ? (
            <div style={s.activityList}>
              {latestSales.map((s, i) => (
                <div key={i} style={s.activityItem}>
                  <div style={{ ...s.activityDot, backgroundColor: '#60a5fa' }} />
                  <div style={s.activityText}>
                    <strong style={s.highlight}>{s.seller?.firstName}</strong> sold bond <strong style={s.highlight}>{s.serial}</strong> ({s.denomination})
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={s.emptyActivity}>No recent sales</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={s.page}>
      <Topbar title="Dashboard" breadcrumb="Admin → Overview" />
      <div style={s.content}>
        {loading ? (
          <div style={s.loadingWrap}>
            <div style={s.spinner} />
            <div style={s.loadingText}>Loading statistics...</div>
          </div>
        ) : (
          <>
            {renderKPIs()}
            
            <div style={s.gridRow}>
              <div style={s.gridColLeft}>
                {renderActionRequired()}
                {renderCharts()}
              </div>
              <div style={s.gridColRight}>
                {renderRecentActivity()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  content: { flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 },

  loadingWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 },
  spinner: { width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(232,184,75,0.1)', borderTopColor: '#e8b84b', animation: 'spin 1s linear infinite' },
  loadingText: { color: '#6a8fad', fontSize: 13, fontFamily: "'DM Mono', monospace" },

  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  kpiCard: {
    background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 12,
    padding: '20px', display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
  },
  kpiIcon: { fontSize: 28, flexShrink: 0, width: 48, height: 48, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  kpiContent: { display: 'flex', flexDirection: 'column' },
  kpiLabel: { fontSize: 11, color: '#6a8fad', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: "'DM Mono', monospace", marginBottom: 4 },
  kpiValue: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, lineHeight: 1 },

  gridRow: { display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' },
  gridColLeft: { display: 'flex', flexDirection: 'column', gap: 24 },
  gridColRight: { display: 'flex', flexDirection: 'column', gap: 24 },

  sectionCard: {
    background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 12,
    padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  sectionTitle: { margin: '0 0 20px 0', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#e2eaf5' },

  alertBox: { background: 'rgba(251,191,36,0.05)', borderLeft: '4px solid #fbbf24', borderRadius: '4px 8px 8px 4px', padding: '16px', marginBottom: 16 },
  alertHeader: { display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 600, color: '#e2eaf5', marginBottom: 12 },
  actionList: { display: 'flex', flexDirection: 'column', gap: 12 },
  actionItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' },
  actionItemTitle: { fontSize: 13.5, fontWeight: 600, color: '#e2eaf5' },
  actionItemSub: { fontSize: 12, color: '#6a8fad', marginTop: 4 },
  
  approveBtn: {
    padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)',
    background: 'rgba(34,197,94,0.1)', color: '#4ade80', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
  },
  uploadBtn: {
    padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(96,165,250,0.3)',
    background: 'rgba(96,165,250,0.1)', color: '#60a5fa', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
  },

  chartContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 },

  activitySection: { marginBottom: 24 },
  activitySubTitle: { margin: '0 0 12px 0', fontSize: 12, color: '#6a8fad', textTransform: 'uppercase', letterSpacing: 1.2, fontFamily: "'DM Mono', monospace" },
  activityList: { display: 'flex', flexDirection: 'column', gap: 16 },
  activityItem: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  activityDot: { width: 8, height: 8, borderRadius: '50%', backgroundColor: '#e8b84b', marginTop: 5, flexShrink: 0, boxShadow: '0 0 8px rgba(232,184,75,0.5)' },
  activityText: { fontSize: 13, color: '#e2eaf5', lineHeight: 1.5 },
  highlight: { color: '#e8b84b', fontWeight: 600 },
  emptyActivity: { fontSize: 13, color: '#304d68', fontStyle: 'italic' },
};
