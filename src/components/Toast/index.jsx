import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import './styles.css';

export default function Toast({ message, type, onClose }) {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{icons[type] || icons.info}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}><X size={16} /></button>
    </div>
  );
}
