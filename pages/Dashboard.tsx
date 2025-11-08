import React, { useMemo, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { calculateWeekTotal, formatMinutesToHM, formatMinutesToHours } from '../utils/timeUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { parseISO, format, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Week } from '../types';
import EditWeekModal from '../components/modals/EditWeekModal';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-text-dark mt-1">{value}</p>
    </div>
    <div className="bg-primary/10 text-primary p-3 rounded-full">{icon}</div>
  </div>
);

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
                className="bg-primary h-4 rounded-full transition-all duration-500" 
                style={{ width: `${percentage > 100 ? 100 : percentage}%` }}
            ></div>
        </div>
    );
};


const Dashboard: React.FC = () => {
  const { activeUser, weeks, manualAdjustments, updateWeek, setActivePage } = useAppContext();
  const [editingWeek, setEditingWeek] = useState<Week | null>(null);
  
  const userWeeks = useMemo(() => {
    if (!activeUser) return [];
    return weeks.filter(w => w.userId === activeUser.id).sort((a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime());
  }, [activeUser, weeks]);

  const userAdjustments = useMemo(() => {
    if (!activeUser) return [];
    return manualAdjustments.filter(adj => adj.userId === activeUser.id);
  }, [activeUser, manualAdjustments]);

  const stats = useMemo(() => {
    if (!activeUser) return { totalMinutes: 0, remainingMinutes: 0, weeksRecorded: 0, monthlyMinutes: 0 };
    
    const weekMinutes = userWeeks.reduce((acc, week) => acc + calculateWeekTotal(week), 0);
    const adjustmentMinutes = userAdjustments.reduce((acc, adj) => acc + adj.hours * 60, 0);
    const totalMinutes = weekMinutes + adjustmentMinutes;
    
    const weeksRecorded = userWeeks.length;
    const remainingMinutes = (activeUser.annualTarget * 60) - totalMinutes;
    
    const latestDate = userWeeks.length > 0 ? parseISO(userWeeks[0].startDate) : new Date();
    const monthlyMinutes = userWeeks
      .filter(w => isSameMonth(parseISO(w.startDate), latestDate))
      .reduce((acc, week) => acc + calculateWeekTotal(week), 0);
    
    const monthlyAdjustmentMinutes = userAdjustments
        .filter(adj => isSameMonth(parseISO(adj.date), latestDate))
        .reduce((acc, adj) => acc + adj.hours * 60, 0);

    return { totalMinutes, remainingMinutes, weeksRecorded, monthlyMinutes: monthlyMinutes + monthlyAdjustmentMinutes };
  }, [activeUser, userWeeks, userAdjustments]);
  
  const adjustmentChartData = useMemo(() => {
    if (userAdjustments.length === 0) return [];

    const groupedByReason = userAdjustments.reduce((acc, adj) => {
        const reason = adj.reason || 'Non spécifié';
        if (!acc[reason]) {
            acc[reason] = 0;
        }
        acc[reason] += adj.hours;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(groupedByReason)
        .map(([name, value]) => ({
            name,
            value: parseFloat((value as number).toFixed(2)),
        }))
        .filter(item => item.value !== 0);
  }, [userAdjustments]);

  const weeklyChartData = useMemo(() => {
      return userWeeks
          .slice(0, 12)
          .reverse()
          .map(week => ({
              name: `S${week.weekNumber}`,
              heures: formatMinutesToHours(calculateWeekTotal(week)),
          }));
  }, [userWeeks]);

  const handleSaveWeek = (updatedWeek: Week) => {
    updateWeek(updatedWeek);
    setEditingWeek(null);
  };
  
  if (!activeUser) {
    return <div>Veuillez sélectionner un utilisateur.</div>;
  }

  return (
    <>
      <div className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-poppins font-bold text-text-dark">Bon retour, {activeUser.name} !</h1>
            <p className="text-gray-500 mt-1">Voici un résumé de votre activité.</p>
          </div>
           <button
            onClick={() => setActivePage('heures')}
            className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            Remplir mes heures
          </button>
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Heures totales" value={formatMinutesToHM(stats.totalMinutes)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>} />
          <StatCard title="Heures restantes" value={formatMinutesToHM(stats.remainingMinutes)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>} />
          <StatCard title="Semaines enregistrées" value={stats.weeksRecorded.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>} />
          <StatCard title="Heures ce mois-ci" value={formatMinutesToHM(stats.monthlyMinutes)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-text-dark mb-2">Progression annuelle</h3>
          <p className="text-sm text-gray-500 mb-4">Objectif de {activeUser.annualTarget} heures</p>
          <div className="flex items-center gap-4">
              <span className="font-semibold">{formatMinutesToHM(stats.totalMinutes)}</span>
              <ProgressBar value={stats.totalMinutes} max={activeUser.annualTarget * 60} />
              <span className="font-semibold">{activeUser.annualTarget}h</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Bilan des ajustements par raison</h3>
            <div className="flex-1 flex items-center justify-center" style={{ minHeight: 250 }}>
             {adjustmentChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    layout="vertical" 
                    data={adjustmentChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" unit="h" />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} interval={0} />
                    <Tooltip formatter={(value) => [`${value}h`, 'Total']} cursor={{fill: 'rgba(156, 93, 245, 0.1)'}} />
                    <ReferenceLine x={0} stroke="#6b7280" />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {adjustmentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10B981' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500">
                    <p>Aucun ajustement manuel enregistré.</p>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-text-dark mb-4">12 dernières semaines</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                  <BarChart data={weeklyChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis unit="h" tick={{ fontSize: 12 }} />
                      <Tooltip cursor={{fill: 'rgba(156, 93, 245, 0.1)'}} formatter={(value) => [`${value} heures`, 'Total']}/>
                      <Bar dataKey="heures" fill="#9C5DF5" radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-text-dark mb-4">Dernières semaines enregistrées</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Semaine n°</th>
                  <th scope="col" className="px-6 py-3">Période</th>
                  <th scope="col" className="px-6 py-3">Type</th>
                  <th scope="col" className="px-6 py-3">Total</th>
                  <th scope="col" className="px-6 py-3"><span className="sr-only">Modifier</span></th>
                </tr>
              </thead>
              <tbody>
                {userWeeks.slice(0, 5).map(week => (
                  <tr key={week.id} className="bg-white border-b">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{week.weekNumber}</th>
                    <td className="px-6 py-4">{format(parseISO(week.startDate), 'd MMM yyyy', { locale: fr })}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${week.isHolidayWeek ? 'bg-orange-100 text-accent-orange' : 'bg-purple-100 text-primary'}`}>
                          {week.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatMinutesToHM(calculateWeekTotal(week))}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setEditingWeek(week)} className="font-medium text-primary hover:underline">Modifier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {editingWeek && (
        <EditWeekModal
          week={editingWeek}
          onClose={() => setEditingWeek(null)}
          onSave={handleSaveWeek}
        />
      )}
    </>
  );
};

export default Dashboard;