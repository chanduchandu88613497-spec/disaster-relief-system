import { useState } from 'react';
import './Sidebar.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'volunteers', label: 'Volunteers', icon: '👥' },
  { id: 'dispatches', label: 'Dispatches', icon: '🚀' },
  { id: 'heatmap', label: 'Heat Map', icon: '🗺️' },
];

export default function Sidebar({ activeTab, onTabChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`} id="main-sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">🚨</span>
          {!collapsed && <span className="sidebar__logo-text">DisasterRelief</span>}
        </div>
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          id="sidebar-toggle"
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${activeTab === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => onTabChange(item.id)}
            title={item.label}
            id={`nav-${item.id}`}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar__nav-label">{item.label}</span>}
            {activeTab === item.id && <span className="sidebar__nav-indicator" />}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        {!collapsed && (
          <div className="sidebar__footer-content">
            <div className="sidebar__status">
              <span className="sidebar__status-dot" />
              <span className="sidebar__status-text">System Online</span>
            </div>
            <span className="sidebar__version">v1.0.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
