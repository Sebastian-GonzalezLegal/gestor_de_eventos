import React from 'react';
import { FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", type = "danger" }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '0' }}>
        <div className="modal-header" style={{ borderBottom: 'none', padding: '24px 24px 0 24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: type === 'danger' ? 'var(--danger)' : 'var(--text-main)' }}>
            <FaExclamationTriangle />
            {title}
          </h3>
        </div>
        <div className="modal-body" style={{ padding: '16px 24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{message}</p>
        </div>
        <div className="modal-actions" style={{ padding: '24px', background: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={`btn btn-${type}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {type === 'danger' ? <FaTimes /> : <FaCheck />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
