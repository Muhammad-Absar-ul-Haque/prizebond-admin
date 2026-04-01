import React from 'react';

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel, type = 'danger', loading }) {
  if (!open) return null;
  const isApprove = type === 'success';
  const color = isApprove ? '#22c55e' : '#ef4444';
  const colorBg = isApprove ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)';
  const colorBd = isApprove ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)';

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...s.iconWrap, background: colorBg, border: `1px solid ${colorBd}` }}>
          <span style={{ fontSize: 24 }}>{isApprove ? '✓' : '✕'}</span>
        </div>
        <div style={s.title}>{title}</div>
        <div style={s.msg}>{message}</div>
        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button
            style={{ ...s.confirmBtn, background: colorBg, border: `1px solid ${colorBd}`, color }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span style={s.spinner} /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(4,7,14,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.15s ease',
  },
  modal: {
    background: '#0b1120', border: '1px solid #1a2d47',
    borderRadius: 16, padding: '32px 28px',
    width: 380, textAlign: 'center',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', fontSize: 24,
  },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#e2eaf5', marginBottom: 8 },
  msg: { fontSize: 13.5, color: '#6a8fad', lineHeight: 1.6, marginBottom: 24 },
  actions: { display: 'flex', gap: 10, justifyContent: 'center' },
  cancelBtn: {
    flex: 1, padding: '10px 0', borderRadius: 8,
    background: '#101828', border: '1px solid #1a2d47',
    color: '#6a8fad', fontFamily: "'DM Sans', sans-serif",
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.15s',
  },
  confirmBtn: {
    flex: 1, padding: '10px 0', borderRadius: 8,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  spinner: {
    width: 14, height: 14, borderRadius: '50%',
    border: '2px solid currentColor', borderTopColor: 'transparent',
    display: 'inline-block', animation: 'spin 0.7s linear infinite',
  },
};
