import React from 'react';
import StatusBadge from './StatusBadge';

export default function MarketplaceDetailPanel({ listing, onClose, onStatusUpdate }) {
  if (!listing) return null;

  const date = new Date(listing.createdAt).toLocaleDateString('en-PK', { 
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  return (
    <>
      <div style={s.backdrop} onClick={onClose} />
      <div style={s.panel}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerTitle}>Listing Details</div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Info */}
        <div style={s.profile}>
          <div style={s.avatar}>#{listing.serial.slice(-3)}</div>
          <div style={s.profileInfo}>
            <div style={s.name}>Bond #{listing.serial}</div>
            <div style={s.email}>Rs. {listing.denomination}</div>
            <StatusBadge status={listing.status} />
          </div>
        </div>

        <div style={s.divider} />

        {/* Fields */}
        <div style={s.fields}>
          {[
            { label: 'Listing ID', value: listing.id, mono: true },
            { label: 'Serial No',  value: listing.serial, mono: true, highlight: true },
            { label: 'Bond Value', value: `Rs. ${listing.denomination}` },
            { label: 'Created At', value: date },
          ].map(({ label, value, mono, highlight }) => (
            <div key={label} style={s.field}>
              <span style={s.fieldLabel}>{label}</span>
              <span style={{ ...s.fieldValue, ...(mono ? s.mono : {}), ...(highlight ? s.highlight : {}) }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={s.divider} />

        {/* Seller Info */}
        <div style={s.sectionTitle}>Seller Information</div>
        <div style={s.fields}>
          {[
            { label: 'Name',  value: `${listing.seller?.firstName} ${listing.seller?.lastName}` },
            { label: 'Email', value: listing.seller?.email, mono: true },
            { label: 'User ID', value: listing.seller?.id, mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label} style={s.field}>
              <span style={s.fieldLabel}>{label}</span>
              <span style={{ ...s.fieldValue, ...(mono ? s.mono : {}) }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={s.divider} />

        {/* Actions */}
        <div style={s.actions}>
          {listing.status === 'ACTIVE' && (
            <button
              style={{ ...s.actionBtn, ...s.removeBtn }}
              onClick={() => onStatusUpdate('REMOVED')}
            >
              ✕ Remove Listing
            </button>
          )}
          {listing.status === 'REMOVED' && (
            <button
              style={{ ...s.actionBtn, ...s.approveBtn }}
              onClick={() => onStatusUpdate('ACTIVE')}
            >
              ✓ Restore Listing
            </button>
          )}
          {listing.status === 'SOLD' && (
            <div style={s.statusNote}>
              <span style={{ color: '#60a5fa', marginRight: 6 }}>✓</span>
              This listing has already been sold.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const s = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(4,7,14,0.5)',
    zIndex: 900, backdropFilter: 'blur(2px)',
  },
  panel: {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: 380, background: '#0b1120',
    borderLeft: '1px solid #1a2d47',
    zIndex: 901, overflowY: 'auto',
    animation: 'slideIn 0.2s ease',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px', borderBottom: '1px solid #1a2d47',
  },
  headerTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#e2eaf5' },
  closeBtn: {
    background: '#101828', border: '1px solid #1a2d47',
    color: '#6a8fad', width: 30, height: 30, borderRadius: 6,
    cursor: 'pointer', fontSize: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  profile: { padding: '24px 24px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' },
  avatar: {
    width: 52, height: 52, borderRadius: 12, flexShrink: 0,
    background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#e8b84b',
  },
  profileInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  name: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: '#e2eaf5' },
  email: { fontSize: 12, color: '#6a8fad', fontFamily: "'DM Mono', monospace", marginBottom: 4 },
  divider: { height: 1, background: '#1a2d47', margin: '0 24px' },
  sectionTitle: { padding: '20px 24px 0', fontSize: 11, fontWeight: 700, color: '#e8b84b', textTransform: 'uppercase', letterSpacing: 1.5 },
  fields: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel: { fontSize: 11, color: '#304d68', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: 1 },
  fieldValue: { fontSize: 13, color: '#e2eaf5', fontWeight: 500, textAlign: 'right', maxWidth: 220 },
  mono: { fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#6a8fad' },
  highlight: { color: '#e8b84b', fontWeight: 700 },
  actions: { padding: '24px', marginTop: 'auto' },
  actionBtn: {
    width: '100%', padding: '12px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
    cursor: 'pointer', border: '1px solid', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 7,
    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
  },
  removeBtn: { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' },
  approveBtn: { background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)', color: '#4ade80' },
  statusNote: {
    padding: '12px 16px', borderRadius: 8,
    background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.2)',
    fontSize: 12.5, color: '#6a8fad', lineHeight: 1.5,
  },
};
