import React, { useState, useRef } from 'react';
import { draws as drawsService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ImportResultsModal({ draw, onClose, onSuccess }) {
  const { show } = useToast();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
    } else {
      show('Please select a valid PDF file', 'error');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const resp = await drawsService.importResults(draw.id, file);
      setStats(resp.stats);
      show('Results imported and scrutiny complete', 'success');
    } catch (err) {
      show(err.message || 'Failed to import results', 'error');
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onSuccess();
  };

  return (
    <div style={s.overlay} onClick={stats ? null : onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.topBar}>
          <div>
            <div style={s.title}>Import Results</div>
            <div style={s.subTitle}>Draw #{draw.drawNumber} — {draw.city} ({draw.denomination})</div>
          </div>
          {!stats && <button style={s.closeBtn} onClick={onClose}>✕</button>}
        </div>

        {!stats ? (
          <div style={s.body}>
            <div 
              style={{ ...s.dropZone, ...(file ? s.dropZoneActive : {}) }} 
              onClick={() => fileInputRef.current.click()}
            >
              <div style={s.uploadIcon}>{file ? '📄' : '📁'}</div>
              <div style={s.uploadText}>{file ? file.name : 'Click to select PDF or drag & drop'}</div>
              <div style={s.uploadSub}>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Official prize bond result PDF'}</div>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>

            <div style={s.footer}>
              <button style={s.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
              <button 
                style={s.uploadBtn} 
                disabled={!file || loading}
                onClick={handleUpload}
              >
                {loading ? 'Processing...' : 'Upload & Scrutinize'}
              </button>
            </div>
          </div>
        ) : (
          <div style={s.body}>
            <div style={s.successHeader}>
              <div style={s.successIcon}>✓</div>
              <div style={s.successTitle}>Import Complete</div>
              <div style={s.successDesc}>The PDF has been parsed and winners have been notified.</div>
            </div>

            <div style={s.statsGrid}>
              <div style={s.statBox}>
                <div style={s.statVal}>{stats.total}</div>
                <div style={s.statLab}>Total Prizes</div>
              </div>
              <div style={s.statBox}>
                <div style={{ ...s.statVal, color: '#fbbf24' }}>{stats.first}</div>
                <div style={s.statLab}>1st Prize</div>
              </div>
              <div style={s.statBox}>
                <div style={{ ...s.statVal, color: '#94a3b8' }}>{stats.second}</div>
                <div style={s.statLab}>2nd Prize</div>
              </div>
              <div style={s.statBox}>
                <div style={{ ...s.statVal, color: '#b45309' }}>{stats.third}</div>
                <div style={s.statLab}>3rd Prize</div>
              </div>
            </div>

            <div style={s.noticeBox}>
              <span style={s.noticeIcon}>🔔</span>
              <div>
                <span style={{ fontWeight: 700, color: '#4ade80' }}>{stats.newUserWinners} users</span> found in your database who won a prize in this draw!
              </div>
            </div>

            <button style={s.doneBtn} onClick={handleFinish}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(4,7,14,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' },
  modal: { background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 16, width: 440, overflow: 'hidden', boxShadow: '0 32px 100px rgba(0,0,0,0.7)' },
  topBar: { padding: '20px 24px', borderBottom: '1px solid #1a2d47', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#e8b84b' },
  subTitle: { fontSize: 11, color: '#304d68', fontWeight: 600, fontFamily: "'DM Mono', monospace", marginTop: 4 },
  closeBtn: { background: 'none', border: 'none', color: '#304d68', cursor: 'pointer', fontSize: 16 },

  body: { padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },
  dropZone: { 
    background: '#07090f', border: '2px dashed #1a2d47', borderRadius: 12, 
    padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dropZoneActive: { borderColor: '#e8b84b', background: 'rgba(232,184,75,0.04)' },
  uploadIcon: { fontSize: 32, marginBottom: 12 },
  uploadText: { fontSize: 14, color: '#e2eaf5', fontWeight: 600, marginBottom: 4 },
  uploadSub: { fontSize: 11, color: '#304d68', fontFamily: "'DM Mono', monospace" },

  footer: { display: 'flex', gap: 12 },
  cancelBtn: { flex: 1, padding: '12px 0', borderRadius: 8, background: 'transparent', border: '1px solid #1a2d47', color: '#6a8fad', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  uploadBtn: { flex: 2, padding: '12px 0', borderRadius: 8, background: '#e8b84b', border: 'none', color: '#07090f', cursor: 'pointer', fontSize: 13, fontWeight: 800, fontFamily: "'Syne', sans-serif", textTransform: 'uppercase' },

  successHeader: { textAlign: 'center', marginBottom: 10 },
  successIcon: { width: 48, height: 48, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' },
  successTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: '#e2eaf5', marginBottom: 6 },
  successDesc: { fontSize: 13, color: '#6a8fad', lineHeight: 1.5 },

  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  statBox: { background: '#07090f', border: '1px solid #1a2d47', borderRadius: 10, padding: '12px 16px', textAlign: 'center' },
  statVal: { fontSize: 20, fontWeight: 800, color: '#e2eaf5', fontFamily: "'Syne', sans-serif" },
  statLab: { fontSize: 10, color: '#304d68', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4, fontFamily: "'DM Mono', monospace" },

  noticeBox: { 
    background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', 
    borderRadius: 10, padding: 14, display: 'flex', gap: 12, alignItems: 'center',
    fontSize: 13, color: '#6a8fad', lineHeight: 1.4
  },
  noticeIcon: { fontSize: 18 },

  doneBtn: { padding: '12px 0', borderRadius: 8, background: '#1a2d47', border: 'none', color: '#e2eaf5', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif", textTransform: 'uppercase' },
};
