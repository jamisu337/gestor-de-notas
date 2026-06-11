import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { Menu } from 'lucide-react';
import './styles.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-container">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      
      <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar />
      </div>

      <main className="main-content">
        <header className="mobile-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/favicon.png" alt="Polari" style={{ width: '24px', height: '24px' }} />
            <h2 style={{ margin: 0 }}>Polari</h2>
          </div>
        </header>
        
        <div className="content-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
