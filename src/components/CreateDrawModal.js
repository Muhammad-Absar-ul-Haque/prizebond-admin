import React, { useState } from 'react';
import { draws as drawsService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function CreateDrawModal({ open, onClose, onSuccess, denominations }) {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    drawNumber: '',
    date: new Date().toISOString().split('T')[0],
    city: '',
    denomination: denominations[0] || 100
  });

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await drawsService.create(form);
      show(`Draw #${form.drawNumber} created successfully`, 'success');
      onSuccess();
    } catch (err) {
      show(err.message || 'Failed to create draw', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.topBar}>
          <div style={s.title}>Initialize New Draw</div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        
        <form style={s.form} onSubmit={handleSubmit}>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Draw Number</label>
              <input 
                style={s.input} 
                required 
                placeholder="e.g. 98" 
                value={form.drawNumber}
                onChange={(e) => setForm({ ...form, drawNumber: e.target.value })}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Draw Date</label>
              <input 
                style={s.input} 
                type="date" 
                required 
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>City (Venue)</label>
              <input 
                style={s.input} 
                required 
                placeholder="e.g. Karachi" 
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Denomination</label>
              <select 
                style={s.select} 
                value={form.denomination}
                onChange={(e) => setForm({ ...form, denomination: parseInt(e.target.value) })}
              >
                {denominations.map(d => (
                  <option key={d} value={d}>PKR {d}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={s.footer}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? 'Initializing...' : 'Create Draw'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(4,7,14,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' },
  modal: { background: '#0b1120', border: '1px solid #1a2d47', borderRadius: 16, width: 440, overflow: 'hidden', boxShadow: '0 32px 100px rgba(0,0,0,0.7)' },
  topBar: { padding: '20px 24px', borderBottom: '1px solid #1a2d47', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#e8b84b', letterSpacing: 0.5 },
  closeBtn: { background: 'none', border: 'none', color: '#304d68', cursor: 'pointer', fontSize: 16 },
  
  form: { padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },
  row: { display: 'flex', gap: 16 },
  field: { flex: 1, display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 11, fontWeight: 700, color: '#304d68', textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'DM Mono', monospace" },
  input: { background: '#07090f', border: '1px solid #1a2d47', borderRadius: 8, padding: '10px 12px', color: '#e2eaf5', fontSize: 14, outline: 'none', fontFamily: "'DM Sans', sans-serif" },
  select: { background: '#07090f', border: '1px solid #1a2d47', borderRadius: 8, padding: '10px 12px', color: '#e2eaf5', fontSize: 14, outline: 'none', appearance: 'none', cursor: 'pointer' },
  
  footer: { marginTop: 10, display: 'flex', gap: 12 },
  cancelBtn: { flex: 1, padding: '12px 0', borderRadius: 8, background: 'transparent', border: '1px solid #1a2d47', color: '#6a8fad', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  submitBtn: { flex: 1.5, padding: '12px 0', borderRadius: 8, background: '#e8b84b', border: 'none', color: '#07090f', cursor: 'pointer', fontSize: 13, fontWeight: 800, fontFamily: "'Syne', sans-serif", textTransform: 'uppercase' },
};
