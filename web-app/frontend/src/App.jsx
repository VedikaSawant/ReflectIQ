import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/shared/Sidebar';
import Navbar from './components/shared/Navbar';
import Dashboard from './pages/Dashboard';
import FieldView from './pages/FieldView';
import DigitalTwin from './pages/DigitalTwin';
import useAlerts from './hooks/useAlerts';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { criticalCount } = useAlerts(60000); // Poll alerts every minute

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <Router>
      <div className="app-layout">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          toggleCollapsed={toggleSidebar} 
          criticalAlertsCount={criticalCount} 
        />
        
        <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Navbar 
            sidebarCollapsed={sidebarCollapsed} 
            toggleSidebar={toggleSidebar} 
            criticalCount={criticalCount} 
          />
          
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/field-upload" element={<FieldView />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
