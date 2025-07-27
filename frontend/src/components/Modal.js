import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div style={{position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)'}}>
      <div style={{background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.18)', width: '100%', maxWidth: 400, padding: 32, position: 'relative', animation: 'fadeIn 0.2s ease-in-out forwards'}}>
        <button
          onClick={onClose}
          style={{position: 'absolute', top: 12, right: 12, color: '#888', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer'}}
          aria-label="Close modal"
        >
          &times;
        </button>
        {title && <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#222'}}>{title}</h3>}
        {children}
      </div>
    </div>
  );
} 