import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import TemplatesPage from './pages/TemplatesPage';
import ReportsPage from './pages/ReportsPage';
import PublicHolidaysPage from './pages/PublicHolidaysPage';
import { useAppContext } from './hooks/useAppContext';

const App: React.FC = () => {
  const { activePage } = useAppContext();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <CalendarPage />;
      case 'heures':
        return <TemplatesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'holidays':
        return <PublicHolidaysPage />;
      default:
        return <Dashboard />;
    }
  };
  
  const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );

  return (
    <div className="bg-bg-light text-text-dark font-sans min-h-screen flex">
      <div className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:w-64 no-print`}>
          <Sidebar />
      </div>

      <main className="flex-1 flex flex-col">
        <div className="lg:hidden p-4 bg-white border-b border-gray-200 flex items-center no-print">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-text-dark">
                <MenuIcon />
            </button>
             <h1 className="font-poppins text-lg text-primary ml-4">AEC - Feuilles d'heures</h1>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;