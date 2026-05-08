import React, { useState, useRef } from 'react';
import { draws as drawsService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function BulkImportModal({ onClose, onSuccess }) {
  const { show } = useToast();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      parseCSV(selected);
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const parsed = lines.map(line => {
        const [drawNumber, date, city, denomination] = line.split(',').map(s => s.trim());
        return { drawNumber, date, city, denomination: parseInt(denomination) };
      }).filter(d => d.drawNumber && d.date && d.city && !isNaN(d.denomination));
      
      setPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (preview.length === 0) return;
    setLoading(true);
    try {
      const resp = await drawsService.bulkCreate(preview);
      show(`Successfully imported ${resp.count} draws`, 'success');
      onSuccess();
    } catch (err) {
      show(err.message || 'Failed to import draws', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.topBar}>
          <div>
            <div style={s.title}>Bulk Import Draws</div>
            <div style={s.subTitle}>Upload CSV: drawNumber, date, city, denomination</div>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={s.body}>
          {!file ? (
            <div 
              style={s.dropZone} 
              onClick={() => fileInputRef.current.click()}
            >
              <div style={s.uploadIcon}>📁</div>
              <div style={s.uploadText}>Click to select CSV</div>
              <div style={s.uploadSub}>Expected format: 105, 2026-01-15, Karachi, 750</div>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div style={s.previewArea}>
              <div style={s.previewHeader}>
                <div style={s.previewTitle}>Preview ({preview.length} draws)</div>
                <button style={s.changeBtn} onClick={() => { setFile(null); setPreview([]); }}>Change File</button>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>#</th>
                      <th style={s.th}>Date</th>
                      <th style={s.th}>City</th>
                      <th style={s.th}>Denom</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((d, i) => (
                      <tr key={i} style={s.tr}>
                        <td style={s.td}>{d.drawNumber}</td>
                        <td style={s.td}>{d.date}</td>
                        <td style={s.td}>{d.city}</td>
                        <td style={s.td}>{d.denomination}</td>
                      </tr>
                    ))}
                    {preview.length > 5 && (
                      <tr>
                        <td colSpan={4} style={s.moreRow}>+ {preview.length - 5} more draws...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={s.footer}>
            <button style={s.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
            <button 
              style={s.uploadBtn} 
              disabled={preview.length === 0 || loading}
              onClick={handleUpload}
            >
              {loading ? 'Importing...' : `Import ${preview.length} Draws`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(4,7,14,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' },
  modal: { background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 16, width: 480, overflow: 'hidden', boxShadow: '0 32px 100px rgba(0,0,0,0.7)' },
  topBar: { padding: '20px 24px', borderBottom: '1px solid #1a2d47', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#e8b84b' },
  subTitle: { fontSize: 11, color: '#304d68', fontWeight: 600, fontFamily: "'DM Mono', monospace", marginTop: 4 },
  closeBtn: { background: 'none', border: 'none', color: '#304d68', cursor: 'pointer', fontSize: 16 },

  body: { padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },
  dropZone: { 
    background: '#07090f', border: '2px dashed #1a2d47', borderRadius: 12, 
    padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
  },
  uploadIcon: { fontSize: 32, marginBottom: 12 },
  uploadText: { fontSize: 14, color: '#e2eaf5', fontWeight: 600, marginBottom: 4 },
  uploadSub: { fontSize: 11, color: '#304d68', fontFamily: "'DM Mono', monospace" },

  previewArea: { display: 'flex', flexDirection: 'column', gap: 12 },
  previewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  previewTitle: { fontSize: 12, fontWeight: 700, color: '#6a8fad', textTransform: 'uppercase' },
  changeBtn: { background: 'none', border: 'none', color: '#e8b84b', fontSize: 11, fontWeight: 600, cursor: 'pointer' },
  
  tableWrap: { background: '#07090f', borderRadius: 8, border: '1px solid #1a2d47', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: { padding: '8px 12px', textAlign: 'left', color: '#304d68', background: '#0b1120', fontWeight: 700 },
  tr: { borderBottom: '1px solid #1a2d47' },
  td: { padding: '8px 12px', color: '#e2eaf5' },
  moreRow: { padding: '8px 12px', textAlign: 'center', color: '#304d68', fontStyle: 'italic' },

  footer: { display: 'flex', gap: 12 },
  cancelBtn: { flex: 1, padding: '12px 0', borderRadius: 8, background: 'transparent', border: '1px solid #1a2d47', color: '#6a8fad', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  uploadBtn: { flex: 2, padding: '12px 0', borderRadius: 8, background: '#e8b84b', border: 'none', color: '#07090f', cursor: 'pointer', fontSize: 13, fontWeight: 800, fontFamily: "'Syne', sans-serif", textTransform: 'uppercase' },
};
