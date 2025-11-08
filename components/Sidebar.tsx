import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Page } from '../types';

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const TemplatesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
);
const ReportsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
);
const HolidaysIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
);

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'dashboard', label: 'Tableau de bord', icon: <DashboardIcon /> },
    { page: 'heures', label: 'Mes Heures', icon: <TemplatesIcon /> },
    { page: 'calendar', label: 'Calendrier', icon: <CalendarIcon /> },
    { page: 'reports', label: 'Rapports', icon: <ReportsIcon /> },
    { page: 'holidays', label: 'Jours Fériés', icon: <HolidaysIcon /> },
];

const Sidebar: React.FC = () => {
    const { users, activeUser, setActiveUser, activePage, setActivePage } = useAppContext();
    const elementaryTeam = users.filter(u => u.team === 'ÉLÉMENTAIRE');
    const nurseryTeam = users.filter(u => u.team === 'MATERNELLE');

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setActiveUser(e.target.value);
    };

    return (
        <aside className="w-64 bg-white h-full flex flex-col border-r border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <ClockIcon />
                    <div className='flex flex-col'>
                        <span className="font-poppins font-bold text-sm text-primary">ARC EN CIEL</span>
                        <span className="text-xs text-gray-500">FEUILLES D'HEURES</span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <label htmlFor="user-select" className="block text-sm font-medium text-gray-500 mb-2">Animateur / Animatrice</label>
                <select 
                    id="user-select" 
                    value={activeUser?.id || ''} 
                    onChange={handleUserChange}
                    className="w-full bg-gray-50 border border-gray-300 text-text-dark text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                >
                    <optgroup label="ÉQUIPE ÉLÉMENTAIRE">
                        {elementaryTeam.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </optgroup>
                    <optgroup label="ÉQUIPE MATERNELLE">
                        {nurseryTeam.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </optgroup>
                </select>
            </div>

            <nav className="flex-1 px-4">
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <li key={item.page}>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActivePage(item.page); }}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                    activePage === item.page
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className='p-4 text-center text-xs text-gray-400'>
                © {new Date().getFullYear()} Arc-en-Ciel ALSH
            </div>
        </aside>
    );
};

export default Sidebar;