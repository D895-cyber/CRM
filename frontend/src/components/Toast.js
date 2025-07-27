import React from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;
  return (
    <div style={{position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '12px 32px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', color: '#fff', background: type === 'success' ? '#43a047' : '#d32f2f', fontWeight: 600, fontSize: 16}}>
      <span>{message}</span>
      <button onClick={onClose} style={{marginLeft: 16, color: '#fff', background: 'none', border: 'none', fontWeight: 'bold', fontSize: 20, cursor: 'pointer'}}>&times;</button>
    </div>
  );
} 