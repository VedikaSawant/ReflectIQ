import React from 'react';
import { FiBell, FiSearch, FiSettings, FiMenu } from 'react-icons/fi';

export default function Navbar({ sidebarCollapsed, toggleSidebar, criticalCount = 0 }) {
  return (
    <nav className={`navbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="navbar-left">
        <button className="navbar-icon-btn d-md-none" onClick={toggleSidebar}>
          <FiMenu />
        </button>
        <div>
          <div className="navbar-title">RetroVision Intelligence Dashboard</div>
          <div className="navbar-subtitle">NHAI Command Center • Real-time Monitoring</div>
        </div>
      </div>
      
      <div className="navbar-right">
        <div className="navbar-badge">
          <div className="pulse-dot"></div>
          System Online
        </div>
        
        <button className="navbar-icon-btn">
          <FiSearch />
        </button>
        
        <button className="navbar-icon-btn">
          <FiBell />
          {criticalCount > 0 && <span className="notif-dot"></span>}
        </button>
        
        <button className="navbar-icon-btn">
          <FiSettings />
        </button>
        
        <div className="navbar-avatar">NH</div>
      </div>
    </nav>
  );
}
