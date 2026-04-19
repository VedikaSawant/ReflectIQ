import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiCamera, 
  FiMap, 
  FiBarChart2, 
  FiAlertTriangle, 
  FiActivity,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

export default function Sidebar({ collapsed, toggleCollapsed, criticalAlertsCount = 0 }) {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: FiHome },
    { label: 'Map View', path: '#', icon: FiMap }, // Placeholder
    { label: 'Field Upload', path: '/field-upload', icon: FiCamera },
    { label: 'Digital Twin', path: '/digital-twin', icon: FiActivity, isPro: true },
    { label: 'Analytics', path: '#', icon: FiBarChart2 },
    { label: 'Alerts', path: '#', icon: FiAlertTriangle, badge: criticalAlertsCount },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">RV</div>
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">RetroVision</span>
            <span className="sidebar-brand-tag">NHAI AI Platform</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={toggleCollapsed}>
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Core Modules</div>
        {navItems.map((item, idx) => (
          <Link 
            key={idx} 
            to={item.path} 
            className={`sidebar-link ${path === item.path ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <item.icon className="link-icon" />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge > 0 && <span className="link-badge">{item.badge}</span>}
          </Link>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-footer-card">
            <p>Phase 2 Features Locked</p>
            <button className="upgrade-btn">Unlock Auto-Scheduling</button>
          </div>
        </div>
      )}
    </aside>
  );
}
