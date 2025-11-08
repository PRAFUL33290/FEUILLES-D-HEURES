
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Week, WeekTemplate } from '../../types';
import { getWeekNumber, getMonday } from '../../utils/timeUtils';
import { format, addDays } from 'date-fns';

interface AddWeekModalProps {
  onClose: () => void;
  onSave: (week: Week) => void;
}

const AddWeekModal: React.FC<AddWeekModalProps> = ({ onClose, onSave }) => {
  const { activeUser, templates } = useAppContext();
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [notes, setNotes] = useState('');

  const userTemplates = useMemo(() => {
    if (!activeUser) return [];
    const userTpls = templates.filter(t => t.userId === activeUser.id);
    if (userTpls.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(userTpls[0].id);
    }
    return userTpls;
  }, [activeUser, templates, selectedTemplateId]);

  const weekInfo = useMemo(() => {
    if (!startDate) return { weekNumber: '-', monday: '-' };
    const date = new Date(startDate);
    const monday = getMonday(date);
    return {
        weekNumber: getWeekNumber(monday),
        monday: format(monday, 'dd/MM/yyyy')
    };
  }, [startDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const monday = getMonday(new Date(newDate));
    setStartDate(format(monday, 'yyyy-MM-dd'));
  };

  const handleSave = () => {
    if (!activeUser || !selectedTemplateId || !startDate) return;
    
    const selectedTemplate = userTemplates.find(t => t.id === selectedTemplateId);
    if (!selectedTemplate) return;

    const monday = new Date(startDate);

    const newWeek: Week = {
        id: `week-${activeUser.id}-${Date.now()}`,
        userId: activeUser.id,
        weekNumber: weekInfo.weekNumber,
        startDate: format(monday, 'yyyy-MM-dd'),
        templateId: selectedTemplate.id,
        days: selectedTemplate.days.map(dayTpl => {
            const date = addDays(monday, dayTpl.dayOfWeek - 1);
            return {
                date: format(date, 'yyyy-MM-dd'),
                entries: dayTpl.entries.map(entry => ({
                    ...entry,
                    id: `entry-${Date.now()}-${Math.random()}`
                }))
            };
        }),
        type: selectedTemplate.name,
        notes: notes,
        isHolidayWeek: selectedTemplate.category === 'vacances'
    };
    
    onSave(newWeek);
  };
  
  if (!activeUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-poppins font-bold text-text-dark">Ajouter une nouvelle semaine</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>

        <main className="p-6 space-y-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Date de début (Lundi)</label>
            <input type="date" name="startDate" id="startDate" value={startDate} onChange={handleDateChange} className="w-full bg-gray-50 border border-gray-300 text-text-dark text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"/>
            <p className="text-xs text-gray-500 mt-1">Semaine n° <span className="font-semibold">{weekInfo.weekNumber}</span></p>
          </div>
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">Modèle de semaine</label>
            <select name="template" id="template" value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-text-dark text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5">
              {userTemplates.map(tpl => (
                <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
              ))}
            </select>
          </div>
           <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (facultatif)</label>
            <textarea name="notes" id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-gray-50 border border-gray-300 text-text-dark text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5" placeholder="Ajoutez des détails sur cette semaine..."></textarea>
          </div>
        </main>
        
        <footer className="p-6 border-t bg-gray-50 flex justify-end items-center rounded-b-xl">
           <div className="flex gap-3">
            <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-text-dark font-semibold rounded-lg hover:bg-gray-300 transition-colors">Annuler</button>
            <button onClick={handleSave} className="py-2 px-4 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition-colors">Ajouter la semaine</button>
           </div>
        </footer>

      </div>
    </div>
  );
};

export default AddWeekModal;