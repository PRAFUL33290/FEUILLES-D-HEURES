import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { calculateWeekTotal, formatMinutesToHM } from '../utils/timeUtils';
import { parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ReportsPage: React.FC = () => {
    const { activeUser, weeks, manualAdjustments } = useAppContext();
    
    const userWeeks = useMemo(() => {
        if (!activeUser) return [];
        return weeks.filter(w => w.userId === activeUser.id).sort((a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime());
    }, [activeUser, weeks]);

    const userAdjustments = useMemo(() => {
        if (!activeUser) return [];
        return manualAdjustments.filter(adj => adj.userId === activeUser.id).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    }, [activeUser, manualAdjustments]);

    const totals = useMemo(() => {
        const weekMinutes = userWeeks.reduce((sum, week) => sum + calculateWeekTotal(week), 0);
        const adjustmentMinutes = userAdjustments.reduce((sum, adj) => sum + adj.hours * 60, 0);
        const totalMinutes = weekMinutes + adjustmentMinutes;
        
        const classicMinutes = userWeeks.filter(w => !w.isHolidayWeek).reduce((sum, week) => sum + calculateWeekTotal(week), 0);
        const holidayMinutes = userWeeks.filter(w => w.isHolidayWeek).reduce((sum, week) => sum + calculateWeekTotal(week), 0);
        const remainingMinutes = (activeUser?.annualTarget || 0) * 60 - totalMinutes;
        const progress = activeUser ? (totalMinutes / (activeUser.annualTarget * 60)) * 100 : 0;

        return { totalMinutes, classicMinutes, holidayMinutes, remainingMinutes, progress };
    }, [userWeeks, userAdjustments, activeUser]);

    const handlePdfExport = () => {
        window.print();
    };

    const handleCsvExport = () => {
        if (!activeUser) return;

        const headers = ["Date", "Type", "Description/Raison", "Total Heures"];
        
        const escapeCsvCell = (cell: string | number) => {
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        };
        
        const weekData = userWeeks.map(week => [
            format(parseISO(week.startDate), 'dd/MM/yyyy', { locale: fr }),
            "Semaine",
            `S${week.weekNumber} - ${week.type}`,
            formatMinutesToHM(calculateWeekTotal(week)),
        ].map(escapeCsvCell));

        const adjData = userAdjustments.map(adj => [
            format(parseISO(adj.date), 'dd/MM/yyyy', { locale: fr }),
            "Ajustement",
            adj.reason,
            `${adj.hours > 0 ? '+' : ''}${adj.hours}h`,
        ].map(escapeCsvCell));


        const headerRow = headers.join(',');
        const contentRows = [...weekData, ...adjData].map(row => row.join(',')).join('\n');
        const csvContent = `${headerRow}\n${contentRows}`;
            
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `rapport_heures_${activeUser.name.toLowerCase()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between no-print">
                <div>
                    <h1 className="text-3xl font-poppins font-bold text-text-dark">Rapports</h1>
                    <p className="text-gray-500 mt-1">Vue d'ensemble et détail de vos heures travaillées.</p>
                </div>
                <div className="flex gap-2">
                     <button onClick={handleCsvExport} className="bg-gray-200 text-text-dark font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Export Excel
                    </button>
                    <button onClick={handlePdfExport} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Export PDF
                    </button>
                </div>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm printable-card">
                <h3 className="text-lg font-semibold text-text-dark mb-4">Vue d'ensemble</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total Heures</p>
                        <p className="text-xl font-bold text-primary">{formatMinutesToHM(totals.totalMinutes)}</p>
                    </div>
                     <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Heures Restantes</p>
                        <p className="text-xl font-bold text-text-dark">{formatMinutesToHM(totals.remainingMinutes)}</p>
                    </div>
                     <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Progression</p>
                        <p className="text-xl font-bold text-text-dark">{totals.progress.toFixed(2)}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Heures Vacances</p>
                        <p className="text-xl font-bold text-accent-orange">{formatMinutesToHM(totals.holidayMinutes)}</p>
                    </div>
                </div>
            </div>

            {userAdjustments.length > 0 && (
                 <div className="bg-white p-6 rounded-xl shadow-sm printable-card">
                    <h3 className="text-lg font-semibold text-text-dark mb-4">Historique des ajustements</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Heures</th>
                                <th scope="col" className="px-6 py-3">Raison</th>
                            </tr>
                            </thead>
                            <tbody>
                            {userAdjustments.map(adj => (
                                <tr key={adj.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{format(parseISO(adj.date), 'd MMM yyyy', { locale: fr })}</td>
                                <td className={`px-6 py-4 font-semibold ${adj.hours > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {adj.hours > 0 ? '+' : ''}{adj.hours}h
                                </td>
                                <td className="px-6 py-4 text-gray-500 italic">{adj.reason || '-'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm printable-card">
                <h3 className="text-lg font-semibold text-text-dark mb-4">Liste complète des semaines</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Semaine n°</th>
                            <th scope="col" className="px-6 py-3">Période</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Notes</th>
                        </tr>
                        </thead>
                        <tbody>
                        {userWeeks.map(week => (
                            <tr key={week.id} className="bg-white border-b hover:bg-gray-50">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{week.weekNumber}</th>
                            <td className="px-6 py-4">{format(parseISO(week.startDate), 'd MMM yyyy', { locale: fr })}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${week.isHolidayWeek ? 'bg-orange-100 text-accent-orange' : 'bg-purple-100 text-primary'}`}>
                                    {week.type}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-semibold">{formatMinutesToHM(calculateWeekTotal(week))}</td>
                            <td className="px-6 py-4 text-gray-500 italic">{week.notes || '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
