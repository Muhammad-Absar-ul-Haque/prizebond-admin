import React, { useState, useEffect, useCallback } from 'react';
import { marketplace as marketplaceService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Topbar from '../components/Topbar';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import MarketplaceDetailPanel from '../components/MarketplaceDetailPanel';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'SOLD', 'REMOVED'];
const DENOMINATION_FILTERS = ['ALL', 100, 200, 750, 1500, 7500, 15000, 25000, 40000];

export default function Marketplace() {
  const { show } = useToast();
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'ALL',
    denomination: 'ALL',
    search: '',
    page: 1,
    limit: 10
  });
  const [selectedListing, setSelectedListing] = useState(null);
  const [confirm, setConfirm] = useState(null); // { id, status, serial }

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await marketplaceService.listAll(filters);
      setListings(response.data);
      setMeta(response.meta);
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') return;
      show(err.message || 'Failed to load listings', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, show]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleStatusUpdate = async () => {
    if (!confirm) return;
    try {
      if (confirm.status === 'REMOVED') {
        await marketplaceService.deleteListing(confirm.id);
      } else {
        await marketplaceService.updateStatus(confirm.id, confirm.status);
      }
      show(`Listing #${confirm.serial} ${confirm.status === 'REMOVED' ? 'has been removed' : `marked as ${confirm.status}`}`, 'success');
      fetchListings();
      if (selectedListing?.id === confirm.id) {
        setSelectedListing(prev => ({ ...prev, status: confirm.status }));
      }
    } catch (err) {
      show(err.message || 'Failed to update status', 'error');
    } finally {
      setConfirm(null);
    }
  };


  const openStatusConfirm = (listing, status, e) => {
    e?.stopPropagation();
    setConfirm({ id: listing.id, status, serial: listing.serial });
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={s.page}>
      <Topbar title="Marketplace Management" breadcrumb="Admin → Marketplace" />

      <div style={s.content}>
        {/* Stats Row (Simplified for now) */}
        <div style={s.statsRow}>
          {[
            { label: 'Total Listings', value: meta.total || 0, color: '#e8b84b', icon: '◈' },
            { label: 'Active', value: listings.filter(l => l.status === 'ACTIVE').length, color: '#4ade80', icon: '◉' },
            { label: 'Sold', value: listings.filter(l => l.status === 'SOLD').length, color: '#60a5fa', icon: '✓' },
            { label: 'Removed', value: listings.filter(l => l.status === 'REMOVED').length, color: '#f87171', icon: '✕' },
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
            <div style={s.filterTabs}>
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  style={{ ...s.filterTab, ...(filters.status === f ? s.filterTabActive : {}) }}
                  onClick={() => handleFilterChange('status', f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <select 
              style={s.select}
              value={filters.denomination}
              onChange={(e) => handleFilterChange('denomination', e.target.value)}
            >
              <option value="ALL">All Values</option>
              {DENOMINATION_FILTERS.slice(1).map(d => (
                <option key={d} value={d}>Rs. {d}</option>
              ))}
            </select>
          </div>

          <div style={s.searchWrap}>
            <span style={s.searchIcon}>⌕</span>
            <input
              style={s.searchInput}
              placeholder="Search serial or seller…"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <button style={s.refreshBtn} onClick={fetchListings}>↻ Refresh</button>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.theadRow}>
                {['Listing', 'Denomination', 'Seller', 'Status', 'Date', 'Actions'].map((h) => (
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
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={6} style={s.emptyCell}>
                    <div style={s.empty}>
                      <div style={s.emptyIcon}>◈</div>
                      <div style={s.emptyText}>No listings found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                listings.map((listing, i) => (
                  <tr
                    key={listing.id}
                    style={{ ...s.tr, animationDelay: `${i * 30}ms` }}
                    onClick={() => setSelectedListing(listing)}
                  >
                    <td style={s.td}>
                      <div style={s.serialCell}>
                        <div style={s.serial}>#{listing.serial}</div>
                        <div style={s.id}>ID: {listing.id}</div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={s.denomBadge}>Rs. {listing.denomination}</span>
                    </td>
                    <td style={s.td}>
                      <div style={s.sellerName}>{listing.seller?.firstName} {listing.seller?.lastName}</div>
                      <div style={s.sellerEmail}>{listing.seller?.email}</div>
                    </td>
                    <td style={s.td}><StatusBadge status={listing.status} /></td>
                    <td style={s.td}><span style={s.dateText}>{formatDate(listing.createdAt)}</span></td>
                    <td style={{ ...s.td, ...s.actionCell }} onClick={(e) => e.stopPropagation()}>
                      <div style={s.actionBtns}>
                        {listing.status === 'ACTIVE' && (
                          <button style={s.removeBtn} onClick={(e) => openStatusConfirm(listing, 'REMOVED', e)}>Remove</button>
                        )}
                        <button style={s.viewBtn} onClick={() => setSelectedListing(listing)}>Details</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div style={s.pagination}>
            <button 
              disabled={!meta.hasPrevPage} 
              onClick={() => handleFilterChange('page', filters.page - 1)}
              style={{...s.pageBtn, opacity: meta.hasPrevPage ? 1 : 0.4}}
            >
              Previous
            </button>
            <span style={s.pageInfo}>Page {meta.page} of {meta.totalPages}</span>
            <button 
              disabled={!meta.hasNextPage} 
              onClick={() => handleFilterChange('page', filters.page + 1)}
              style={{...s.pageBtn, opacity: meta.hasNextPage ? 1 : 0.4}}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedListing && (
        <MarketplaceDetailPanel
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onStatusUpdate={(status) => openStatusConfirm(selectedListing, status)}
        />
      )}

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleStatusUpdate}
        type="danger"
        title="Update Listing Status?"
        message={`Are you sure you want to mark listing #${confirm?.serial} as ${confirm?.status}?`}
        confirmLabel="Yes, Update"
      />
    </div>
  );
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#07090f' },
  content: { flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 },
  
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 },
  statCard: {
    background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 10,
    padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
  },
  statIcon: { fontSize: 22, flexShrink: 0 },
  statLabel: { fontSize: 11, color: '#304d68', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: "'DM Mono', monospace" },
  statValue: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, lineHeight: 1.1, marginTop: 2 },

  toolbar: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  filterGroup: { display: 'flex', gap: 12, alignItems: 'center' },
  filterTabs: { display: 'flex', gap: 4, background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 8, padding: 4 },
  filterTab: {
    padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
    background: 'transparent', color: '#6a8fad', fontSize: 12, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
  },
  filterTabActive: { background: '#152035', color: '#e2eaf5' },
  
  select: {
    background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 8,
    color: '#e2eaf5', padding: '0 12px', height: 36, fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", outline: 'none',
  },

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
  refreshBtn: {
    padding: '7px 14px', borderRadius: 8,
    background: '#101828', border: '1px solid #1a2d47',
    color: '#6a8fad', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
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
  },
  td: { padding: '13px 16px', verticalAlign: 'middle' },
  actionCell: { textAlign: 'right' },

  serialCell: { display: 'flex', flexDirection: 'column' },
  serial: { fontSize: 14, fontWeight: 700, color: '#e8b84b', fontFamily: "'DM Mono', monospace" },
  id: { fontSize: 10, color: '#304d68' },

  denomBadge: {
    fontSize: 11, background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.2)',
    borderRadius: 6, padding: '3px 9px', color: '#e8b84b', fontWeight: 700,
  },
  sellerName: { fontSize: 13, fontWeight: 600, color: '#e2eaf5' },
  sellerEmail: { fontSize: 11, color: '#6a8fad' },
  dateText: { fontSize: 11, color: '#6a8fad', fontFamily: "'DM Mono', monospace" },

  actionBtns: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  removeBtn: {
    padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(239,68,68,0.08)', color: '#f87171',
    fontSize: 11, fontWeight: 700, cursor: 'pointer',
  },
  viewBtn: {
    padding: '5px 12px', borderRadius: 6, border: '1px solid #1a2d47',
    background: '#101828', color: '#6a8fad',
    fontSize: 11, fontWeight: 600, cursor: 'pointer',
  },

  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 10 },
  pageBtn: {
    background: '#0b1120', border: '1px solid #1a2d47', color: '#e2eaf5',
    padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
  },
  pageInfo: { color: '#6a8fad', fontSize: 12, fontFamily: "'DM Mono', monospace" },

  skeletonRow: { borderBottom: '1px solid rgba(26,45,71,0.4)' },
  skeleton: {
    height: 12, borderRadius: 4,
    background: 'linear-gradient(90deg, #101828 25%, #152035 50%, #101828 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  },
  emptyCell: { padding: '60px 20px', textAlign: 'center' },
  empty: { color: '#304d68' },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontWeight: 700 },
};
