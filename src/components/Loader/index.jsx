import React from 'react';
import './styles.css';

export default function Loader({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="loader-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return <div className="spinner"></div>;
}
