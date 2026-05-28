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
          <h2>Gestor Escolar</h2>
        </header>
        
        <div className="content-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
