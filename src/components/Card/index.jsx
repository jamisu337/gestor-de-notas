import React from 'react';
import './styles.css';

export default function Card({ children, title, action }) {
  return (
    <div className="card-container">
      {(title || action) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}
