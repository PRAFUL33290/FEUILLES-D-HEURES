import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { calculateDayTotal, formatMinutesToHM } from '../utils/timeUtils';
import { Day, Week } from '../types';
import AddWeekModal from '../components/modals/AddWeekModal';
import EditWeekModal from '../components/modals/EditWeekModal';

const CalendarPage: React.FC = () => {
    const { activeUser, weeks, addWeek, updateWeek } = useAppContext();
    const [currentMonth, setCurrentMonth] = useState(new Date('2025-11-01'));
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingWeek, setEditingWeek] = useState<Week | null>(null);

    const userWeeks = useMemo(() => {
        if (!activeUser) return [];
        return weeks.filter(w => w.userId === activeUser.id);
    }, [activeUser, weeks]);

    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    
    const handleAddNewWeek = (newWeek: Week) => {
        addWeek(newWeek);
        setIsAddModalOpen(false);
    };

    const handleUpdateWeek = (updatedWeek: Week) => {
        updateWeek(updatedWeek);
        setEditingWeek(null);
    };

    const firstDayOfMonth = startOfMonth(currentMonth);
    const lastDayOfMonth = endOfMonth(currentMonth);
    const firstDayOfGrid = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
    const lastDayOfGrid = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: firstDayOfGrid, end: lastDayOfGrid });
    const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    const getWeekForDay = (day: Date): Week | undefined => {
        return userWeeks.find(week => {
            const startDate = parseISO(week.startDate);
            const endDate = endOfWeek(startDate, { weekStartsOn: 1});
            return day >= startDate && day <= endDate;
        });
    }

    return (
        <>
            <div className="space-y-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-poppins font-bold text-text-dark">Calendrier</h1>
                        <p className="text-gray-500 mt-1">Visualisez et ajoutez vos semaines de travail.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Ajouter une semaine
                    </button>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-text-dark capitalize">
                            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-gray-100">
                               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-100">
                               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                        {weekdays.map(day => (
                            <div key={day} className="text-center font-semibold text-sm py-2 bg-gray-50 text-gray-600">{day}</div>
                        ))}

                        {days.map(day => {
                            const weekData = getWeekForDay(day);
                            const isToday = isSameDay(day, new Date());
                            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                            const isClickable = weekData && isCurrentMonth;
                            
                            let dailyTotalMinutes = 0;
                            if (weekData) {
                                const dayString = format(day, 'yyyy-MM-dd');
                                const dayData: Day | undefined = weekData.days.find(d => d.date === dayString);
                                if (dayData) {
                                    dailyTotalMinutes = calculateDayTotal(dayData);
                                }
                            }
                            
                            const cellBgColor = isCurrentMonth 
                                ? (weekData?.isHolidayWeek ? 'bg-orange-light' : 'bg-white')
                                : 'bg-gray-50';
                            
                            const cellTextColor = isCurrentMonth ? '' : 'text-gray-400';

                            return (
                                <div
                                    key={day.toString()}
                                    className={`h-28 p-2 flex flex-col ${cellBgColor} ${cellTextColor} ${isClickable ? 'cursor-pointer hover:bg-gray-100/50 transition-colors' : ''}`}
                                    onClick={() => isClickable && setEditingWeek(weekData)}
                                >
                                    <span className={`font-semibold self-start ${isToday ? 'bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {dailyTotalMinutes > 0 && (
                                         <div className={`mt-1 p-1 rounded text-xs text-center ${weekData?.isHolidayWeek ? 'bg-accent-orange/20 text-accent-orange' : 'bg-primary/20 text-primary'}`}>
                                            <p className="font-semibold">{formatMinutesToHM(dailyTotalMinutes)}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {isAddModalOpen && (
                <AddWeekModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddNewWeek}
                />
            )}
            {editingWeek && (
                <EditWeekModal
                    week={editingWeek}
                    onClose={() => setEditingWeek(null)}
                    onSave={handleUpdateWeek}
                />
            )}
        </>
    );
};

export default CalendarPage;