import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryPanel from './components/InventoryPanel';
import VolunteerPanel from './components/VolunteerPanel';
import DispatchPanel from './components/DispatchPanel';
import HeatMap from './components/HeatMap';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPanel = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <InventoryPanel />;
      case 'volunteers':
        return <VolunteerPanel />;
      case 'dispatches':
        return <DispatchPanel />;
      case 'heatmap':
        return <HeatMap />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app" id="app-root">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app__main" key={activeTab}>
        {renderPanel()}
      </main>
    </div>
  );
}

export default App;
