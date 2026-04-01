import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={styles.container}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...styles.toast, ...styles[t.type] }} onClick={() => remove(t.id)}>
            <span style={styles.icon}>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            <span style={styles.msg}>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = {
  container: {
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  toast: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 18px', borderRadius: 10, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    animation: 'fadeIn 0.25s ease',
    minWidth: 260, maxWidth: 380,
    border: '1px solid',
  },
  success: { background: 'rgba(13,32,22,0.98)', borderColor: 'rgba(34,197,94,0.4)', color: '#4ade80' },
  error:   { background: 'rgba(32,13,13,0.98)', borderColor: 'rgba(239,68,68,0.4)',  color: '#f87171' },
  info:    { background: 'rgba(11,17,32,0.98)', borderColor: 'rgba(59,130,246,0.4)', color: '#60a5fa' },
  icon: { fontWeight: 700, fontSize: 14, flexShrink: 0 },
  msg:  { color: '#e2eaf5', lineHeight: 1.4 },
};
