import React, { useState, useEffect, useCallback } from 'react';
import { draws as drawsService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Topbar from '../components/Topbar';
import CreateDrawModal from '../components/CreateDrawModal';
import ImportResultsModal from '../components/ImportResultsModal';
import DrawDetailPanel from '../components/DrawDetailPanel';
import ConfirmModal from '../components/ConfirmModal';

const DENOMINATIONS = [100, 200, 750, 1500, 7500, 15000, 25000, 40000];

export default function DrawManagement() {
  const { show } = useToast();
  const [draws, setDraws] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeDenom, setActiveDenom] = useState('ALL');
  
  // Modals state
  const [showCreate, setShowCreate] = useState(false);
  const [importingDraw, setImportingDraw] = useState(null);
  const [selectedDrawId, setSelectedDrawId] = useState(null);
  const [deletingDraw, setDeletingDraw] = useState(null);

  const fetchDraws = useCallback(async () => {
    setLoading(true);
    try {
      const data = await drawsService.listAll();
      setDraws(data);
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') return;
      show(err.message || 'Failed to load draws', 'error');
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => { fetchDraws(); }, [fetchDraws]);

  useEffect(() => {
    let result = draws;
    if (activeDenom !== 'ALL') {
      result = result.filter((d) => d.denomination === parseInt(activeDenom));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) => 
        d.drawNumber.toLowerCase().includes(q) || 
        d.city.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [draws, activeDenom, search]);
  
  const handleDeleteResults = async () => {
    if (!deletingDraw) return;
    try {
      await drawsService.deleteResults(deletingDraw.id);
      show(`Results for Draw #${deletingDraw.drawNumber} deleted`, 'success');
      setDeletingDraw(null);
      setSelectedDrawId(null);
      fetchDraws();
    } catch (err) {
      show(err.message || 'Failed to delete results', 'error');
    }
  };

  const stats = {
    total: draws.length,
    totalWinners: draws.reduce((acc, d) => acc + (d._count?.winningNumbers || 0), 0),
    cities: [...new Set(draws.map(d => d.city))].length,
    latest: draws[0]?.drawNumber || '—'
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={s.page}>
      <Topbar title="Draw Management" breadcrumb="Admin → Draws" />

      <div style={s.content}>
        {/* Stats Row */}
        <div style={s.statsRow}>
          {[
            { label: 'Total Draws', value: stats.total, color: '#e8b84b', icon: '◈' },
            { label: 'Total Winners', value: stats.totalWinners.toLocaleString(), color: '#4ade80', icon: '★' },
            { label: 'Unique Cities', value: stats.cities, color: '#60a5fa', icon: '◎' },
            { label: 'Latest Draw', value: stats.latest, color: '#fbbf24', icon: '◉' },
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
          <div style={s.filterGroup}>
            <div style={s.filterLabel}>Denomination:</div>
            <div style={s.filterTabs}>
              <button 
                style={{ ...s.filterTab, ...(activeDenom === 'ALL' ? s.filterTabActive : {}) }}
                onClick={() => setActiveDenom('ALL')}
              >ALL</button>
              {DENOMINATIONS.map(d => (
                <button 
                  key={d}
                  style={{ ...s.filterTab, ...(activeDenom === d.toString() ? s.filterTabActive : {}) }}
                  onClick={() => setActiveDenom(d.toString())}
                >{d}</button>
              ))}
            </div>
          </div>

          <div style={s.searchWrap}>
            <span style={s.searchIcon}>⌕</span>
            <input 
              style={s.searchInput} 
              placeholder="Search Draw # or City..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={s.actions}>
            <button style={s.refreshBtn} onClick={fetchDraws}>↻</button>
            <button style={s.createBtn} onClick={() => setShowCreate(true)}>+ New Draw</button>
          </div>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.theadRow}>
                <th style={s.th}>Draw #</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>City</th>
                <th style={s.th}>Denomination</th>
                <th style={s.th}>Winners</th>
                <th style={{ ...s.th, ...s.thRight }}>Actions</th>
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
                      <div style={s.emptyIcon}>◎</div>
                      <div style={s.emptyText}>No Draws Found</div>
                      <div style={s.emptySub}>Try creating a new draw or changing filters.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((draw, i) => (
                  <tr key={draw.id} style={{ ...s.tr, animationDelay: `${i * 30}ms` }}>
                    <td style={s.td}>
                      <div style={s.drawNum}>#{draw.drawNumber}</div>
                    </td>
                    <td style={s.td}>
                      <div style={s.dateText}>{formatDate(draw.date)}</div>
                    </td>
                    <td style={s.td}>
                      <span style={s.cityBadge}>{draw.city}</span>
                    </td>
                    <td style={s.td}>
                      <div style={s.denomText}>PKR {draw.denomination}</div>
                    </td>
                    <td style={s.td}>
                      <div style={s.winnerCount}>
                        <span style={s.winnerIcon}>★</span>
                        {draw._count?.winningNumbers || 0}
                      </div>
                    </td>
                    <td style={{ ...s.td, ...s.actionCell }}>
                      <div style={s.btnGroup}>
                        {draw.resultFileUrl ? (
                          <button style={s.viewBtn} onClick={() => window.open(draw.resultFileUrl, '_blank')}>
                            PDF
                          </button>
                        ) : (
                          <button style={s.importBtn} onClick={() => setImportingDraw(draw)}>
                            Import PDF
                          </button>
                        )}
                        <button style={s.detailsBtn} onClick={() => setSelectedDrawId(draw.id)}>Details</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateDrawModal 
        open={showCreate} 
        onClose={() => setShowCreate(false)} 
        onSuccess={() => { setShowCreate(false); fetchDraws(); }}
        denominations={DENOMINATIONS}
      />

      {importingDraw && (
        <ImportResultsModal 
          draw={importingDraw} 
          onClose={() => setImportingDraw(null)} 
          onSuccess={() => { setImportingDraw(null); fetchDraws(); }}
        />
      )}

      <DrawDetailPanel 
        drawId={selectedDrawId} 
        onClose={() => setSelectedDrawId(null)}
        onDeleteResults={(draw) => setDeletingDraw(draw)}
      />

      <ConfirmModal 
        open={!!deletingDraw}
        onClose={() => setDeletingDraw(null)}
        onConfirm={handleDeleteResults}
        title="Delete Draw Results?"
        message={`Are you sure you want to delete all winning numbers and the PDF for Draw #${deletingDraw?.drawNumber}? This action is permanent.`}
        confirmLabel="Delete Results"
        type="danger"
      />
    </div>
  );
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  content: { flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 },
  statCard: {
    background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 10,
    padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
  },
  statIcon: { fontSize: 22, flexShrink: 0 },
  statLabel: { fontSize: 11, color: '#304d68', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: "'DM Mono', monospace" },
  statValue: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: '#e2eaf5', marginTop: 2 },

  toolbar: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: '#0b1120', padding: '12px 16px', borderRadius: 12, border: '1px solid #1a2d47' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: 10 },
  filterLabel: { fontSize: 11, color: '#304d68', fontWeight: 600, fontFamily: "'DM Mono', monospace", textTransform: 'uppercase' },
  filterTabs: { display: 'flex', gap: 4, background: '#07090f', padding: 3, borderRadius: 8, border: '1px solid #1a2d47' },
  filterTab: {
    padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
    background: 'transparent', color: '#6a8fad', fontSize: 11, fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s'
  },
  filterTabActive: { background: '#1a2d47', color: '#e8b84b' },

  searchWrap: {
    flex: 1, minWidth: 150, display: 'flex', alignItems: 'center', gap: 8,
    background: '#07090f', border: '1px solid #1a2d47', borderRadius: 8, padding: '0 12px', height: 34,
  },
  searchIcon: { color: '#304d68', fontSize: 15 },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2eaf5', fontSize: 12, fontFamily: "'DM Sans', sans-serif" },

  actions: { display: 'flex', gap: 8 },
  refreshBtn: { width: 34, height: 34, borderRadius: 8, background: '#0b1120', border: '1px solid #1a2d47', color: '#6a8fad', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' },
  createBtn: { 
    padding: '0 16px', height: 34, borderRadius: 8, background: '#e8b84b', border: 'none', 
    color: '#07090f', fontSize: 12, fontWeight: 800, cursor: 'pointer', 
    fontFamily: "'Syne', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5,
    boxShadow: '0 4px 12px rgba(232,184,75,0.2)'
  },

  tableWrap: { background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { background: '#07090f', borderBottom: '1px solid #1a2d47' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#304d68', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: "'DM Mono', monospace" },
  thRight: { textAlign: 'right' },
  tr: { borderBottom: '1px solid rgba(26,45,71,0.5)', transition: 'background 0.12s', animation: 'fadeIn 0.3s ease both' },
  td: { padding: '12px 16px', verticalAlign: 'middle' },
  
  drawNum: { fontSize: 14, fontWeight: 700, color: '#e8b84b', fontFamily: "'Syne', sans-serif" },
  dateText: { fontSize: 12.5, color: '#6a8fad', fontWeight: 500 },
  cityBadge: { fontSize: 10.5, background: '#152035', border: '1px solid #1a2d47', borderRadius: 6, padding: '3px 8px', color: '#e2eaf5', fontWeight: 600 },
  denomText: { fontSize: 12, color: '#e2eaf5', fontWeight: 600, fontFamily: "'DM Mono', monospace" },
  winnerCount: { display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80', fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace" },
  winnerIcon: { fontSize: 11 },

  actionCell: { textAlign: 'right' },
  btnGroup: { display: 'flex', gap: 6, justifyContent: 'flex-end' },
  importBtn: { padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(232,184,75,0.3)', background: 'rgba(232,184,75,0.08)', color: '#e8b84b', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  viewBtn: { padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.08)', color: '#60a5fa', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  detailsBtn: { padding: '5px 12px', borderRadius: 6, border: '1px solid #1a2d47', background: '#0b1120', color: '#304d68', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },

  skeletonRow: { borderBottom: '1px solid rgba(26,45,71,0.4)' },
  skeleton: { height: 12, borderRadius: 4, background: 'linear-gradient(90deg, #101828 25%, #152035 50%, #101828 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' },
  emptyCell: { padding: '80px 20px' },
  empty: { textAlign: 'center' },
  emptyIcon: { fontSize: 42, color: '#1a2d47', marginBottom: 16 },
  emptyText: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#304d68' },
  emptySub: { fontSize: 13, color: '#1a2d47', marginTop: 8 },
};
