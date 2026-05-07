import React, { useState, useEffect, useCallback } from 'react';
import { draws as drawsService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function DrawDetailPanel({ drawId, onClose, onDeleteResults }) {
  const { show } = useToast();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await drawsService.getById(drawId);
      setDetails(data);
    } catch (err) {
      show(err.message || 'Failed to load draw details', 'error');
    } finally {
      setLoading(false);
    }
  }, [drawId, show]);

  useEffect(() => {
    if (drawId) fetchDetails();
  }, [drawId, fetchDetails]);

  if (!drawId) return null;

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <div style={s.backdrop} onClick={onClose} />
      <div style={s.panel}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.headerTitle}>Draw Details</div>
            {details && <div style={s.headerSub}>#{details.drawNumber} — {details.city}</div>}
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div style={s.loadingWrap}>
            <div style={s.spinner} />
            <div style={s.loadingText}>Fetching draw data...</div>
          </div>
        ) : details ? (
          <div style={s.content}>
            {/* Meta Info */}
            <div style={s.section}>
              <div style={s.sectionTitle}>Overview</div>
              <div style={s.metaGrid}>
                {[
                  { label: 'Draw Number', value: details.drawNumber, mono: true },
                  { label: 'Date',        value: formatDate(details.date) },
                  { label: 'City',        value: details.city },
                  { label: 'Denomination', value: `PKR ${details.denomination}`, mono: true },
                  { label: 'Total Prizes', value: details._count?.winningNumbers || 0, mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label} style={s.metaItem}>
                    <div style={s.metaLabel}>{label}</div>
                    <div style={{ ...s.metaValue, ...(mono ? s.mono : {}) }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.divider} />

            {/* Winning Numbers Preview */}
            <div style={s.section}>
              <div style={s.rowBetween}>
                <div style={s.sectionTitle}>Winners Preview</div>
                <div style={s.countBadge}>{details.winningNumbers?.length || 0} shown</div>
              </div>

              {details.winningNumbers && details.winningNumbers.length > 0 ? (
                <div style={s.winnersList}>
                  {details.winningNumbers.map((w, i) => (
                    <div key={i} style={s.winnerCard}>
                      <div style={s.winnerTier}>{w.prizeTier}</div>
                      <div style={s.winnerSerial}>{w.serial}</div>
                      <div style={s.winnerAmount}>PKR {w.prizeAmount.toLocaleString()}</div>
                    </div>
                  ))}
                  {details._count?.winningNumbers > details.winningNumbers.length && (
                    <div style={s.moreText}>+ {details._count.winningNumbers - details.winningNumbers.length} more results available in full list</div>
                  )}
                </div>
              ) : (
                <div style={s.emptyWinners}>
                  <div style={s.emptyIcon}>◎</div>
                  <div style={s.emptyText}>No results imported yet</div>
                </div>
              )}
            </div>

            <div style={s.divider} />

            {/* Danger Zone */}
            {details.resultFileUrl && (
              <div style={s.dangerZone}>
                <div style={s.sectionTitle}>Danger Zone</div>
                <div style={s.dangerBox}>
                  <div style={s.dangerInfo}>
                    <div style={s.dangerTitle}>Delete Draw Results</div>
                    <div style={s.dangerDesc}>This will remove the PDF and all extracted winning numbers. This action cannot be undone.</div>
                  </div>
                  <button style={s.deleteBtn} onClick={() => onDeleteResults(details)}>
                    Delete Results
                  </button>
                </div>
              </div>
            )}
            
            {details.resultFileUrl && (
              <div style={s.pdfLinkWrap}>
                <button style={s.pdfBtn} onClick={() => window.open(details.resultFileUrl, '_blank')}>
                  View Original PDF ↗
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={s.errorWrap}>Failed to load details.</div>
        )}
      </div>
    </>
  );
}

const s = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(4,7,14,0.5)', zIndex: 900, backdropFilter: 'blur(2px)' },
  panel: {
    position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, background: '#0b1120',
    borderLeft: '1px solid #1a2d47', zIndex: 901, overflowY: 'auto', display: 'flex', flexDirection: 'column'
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid #1a2d47' },
  headerTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: '#e8b84b' },
  headerSub: { fontSize: 11, color: '#304d68', fontFamily: "'DM Mono', monospace", marginTop: 4, textTransform: 'uppercase' },
  closeBtn: { background: '#101828', border: '1px solid #1a2d47', color: '#6a8fad', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  
  loadingWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 },
  spinner: { width: 30, height: 30, borderRadius: '50%', border: '2px solid rgba(232,184,75,0.1)', borderTopColor: '#e8b84b', animation: 'spin 1s linear infinite' },
  loadingText: { fontSize: 12, color: '#304d68', fontFamily: "'DM Mono', monospace" },
  
  content: { display: 'flex', flexDirection: 'column' },
  section: { padding: '24px' },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: '#304d68', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: "'DM Mono', monospace", marginBottom: 16 },
  rowBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  countBadge: { fontSize: 10, background: '#101828', border: '1px solid #1a2d47', borderRadius: 4, padding: '2px 8px', color: '#6a8fad', fontFamily: "'DM Mono', monospace" },
  
  metaGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
  metaItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { fontSize: 12, color: '#6a8fad' },
  metaValue: { fontSize: 13, color: '#e2eaf5', fontWeight: 600, textAlign: 'right' },
  mono: { fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#fbbf24' },
  divider: { height: 1, background: '#1a2d47', margin: '0 24px' },

  winnersList: { display: 'flex', flexDirection: 'column', gap: 8 },
  winnerCard: { 
    background: '#07090f', border: '1px solid #1a2d47', borderRadius: 10, padding: '10px 14px',
    display: 'grid', gridTemplateColumns: '80px 1fr 100px', alignItems: 'center', gap: 6
  },
  winnerTier: { fontSize: 9, fontWeight: 700, color: '#304d68', fontFamily: "'DM Mono', monospace", background: '#101828', padding: '2px 6px', borderRadius: 4, textAlign: 'center' },
  winnerSerial: { fontSize: 14, fontWeight: 700, color: '#e8b84b', fontFamily: "'Syne', sans-serif", letterSpacing: 1 },
  winnerAmount: { fontSize: 11, color: '#4ade80', fontWeight: 600, textAlign: 'right', fontFamily: "'DM Mono', monospace" },
  moreText: { fontSize: 11, color: '#304d68', textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
  
  emptyWinners: { textAlign: 'center', padding: '32px 0', background: '#07090f', borderRadius: 12, border: '1px dashed #1a2d47' },
  emptyIcon: { fontSize: 24, marginBottom: 8, color: '#1a2d47' },
  emptyText: { fontSize: 12, color: '#304d68', fontFamily: "'DM Mono', monospace" },

  dangerZone: { padding: '24px' },
  dangerBox: { background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: 16 },
  dangerInfo: { marginBottom: 16 },
  dangerTitle: { fontSize: 14, fontWeight: 700, color: '#f87171', marginBottom: 4 },
  dangerDesc: { fontSize: 11.5, color: '#6a8fad', lineHeight: 1.5 },
  deleteBtn: { width: '100%', padding: '10px 0', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' },
  
  pdfLinkWrap: { padding: '0 24px 24px' },
  pdfBtn: { width: '100%', padding: '12px 0', borderRadius: 8, background: '#101828', border: '1px solid #1a2d47', color: '#60a5fa', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  
  errorWrap: { padding: 40, textAlign: 'center', color: '#f87171', fontSize: 13 }
};
