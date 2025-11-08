import React, { useState, useEffect } from 'react';
import { WeekTemplate, TimeEntry } from '../../types';
import { calculateTemplateTotal, formatMinutesToHM } from '../../utils/timeUtils';

interface EditTemplateModalProps {
  template: WeekTemplate;
  isCreating: boolean;
  onClose: () => void;
  onSave: (template: WeekTemplate) => void;
}

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({ template, isCreating, onClose, onSave }) => {
  const [formData, setFormData] = useState<WeekTemplate>(template);
  const weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  useEffect(() => {
    // Deep copy and ensure all days are present for editing
    const initialFormData = JSON.parse(JSON.stringify(template));
    const presentDays = initialFormData.days.map((d: { dayOfWeek: number }) => d.dayOfWeek);
    for (let i = 1; i <= 7; i++) {
        if (!presentDays.includes(i)) {
            initialFormData.days.push({ dayOfWeek: i, entries: [] });
        }
    }
    initialFormData.days.sort((a: { dayOfWeek: number }, b: { dayOfWeek: number }) => a.dayOfWeek - b.dayOfWeek);
    setFormData(initialFormData);
  }, [template]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEntryChange = (dayIndex: number, entryIndex: number, field: keyof Omit<TimeEntry, 'id'>, value: string) => {
    setFormData(prev => {
        const newDays = [...prev.days];
        const newEntries = [...newDays[dayIndex].entries];
        newEntries[entryIndex] = { ...newEntries[entryIndex], [field]: value };
        newDays[dayIndex] = { ...newDays[dayIndex], entries: newEntries };
        return { ...prev, days: newDays };
    });
  };
  
  const addEntry = (dayIndex: number) => {
    setFormData(prev => {
        const newDays = [...prev.days];
        const newEntries = [...newDays[dayIndex].entries, { start: '08:00', end: '12:00', description: 'Nouvelle tâche', reason: '' }];
        newDays[dayIndex] = { ...newDays[dayIndex], entries: newEntries };
        return { ...prev, days: newDays };
    });
  };

  const removeEntry = (dayIndex: number, entryIndex: number) => {
    setFormData(prev => {
        const newDays = [...prev.days];
        const newEntries = [...newDays[dayIndex].entries];
        newEntries.splice(entryIndex, 1);
        newDays[dayIndex] = { ...newDays[dayIndex], entries: newEntries };
        return { ...prev, days: newDays };
    });
  };
  
  const handleSave = () => {
      const cleanedTemplate = {
          ...formData,
          days: formData.days.filter(d => d.entries.length > 0)
      };
      onSave(cleanedTemplate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-poppins font-bold text-text-dark">{isCreating ? 'Créer un nouveau modèle' : 'Modifier le modèle'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        
        <main className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom du modèle</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-300 text-text-dark text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"/>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select name="category" id="category" value={formData.category} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-300 text-text-dark text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5">
                <option value="classique">Classique</option>
                <option value="vacances">Vacances</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-6">
            {formData.days && formData.days.slice(0, 5).map((dayTpl, dayIndex) => ( // Show only Mon-Fri
              <div key={dayTpl.dayOfWeek} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-text-dark mb-3">{weekdays[dayIndex]}</h4>
                <div className="space-y-2">
                    {dayTpl.entries.map((entry, entryIndex) => (
                        <div key={entryIndex} className="grid grid-cols-12 gap-2 items-center">
                            <input type="time" value={entry.start} onChange={e => handleEntryChange(dayIndex, entryIndex, 'start', e.target.value)} className="col-span-2 w-full bg-white border border-gray-300 text-sm rounded-md p-1.5" />
                            <input type="time" value={entry.end} onChange={e => handleEntryChange(dayIndex, entryIndex, 'end', e.target.value)} className="col-span-2 w-full bg-white border border-gray-300 text-sm rounded-md p-1.5" />
                            <input type="text" placeholder="Description" value={entry.description} onChange={e => handleEntryChange(dayIndex, entryIndex, 'description', e.target.value)} className="col-span-4 w-full bg-white border border-gray-300 text-sm rounded-md p-1.5" />
                            <input type="text" placeholder="Raison (facultatif)" value={entry.reason || ''} onChange={e => handleEntryChange(dayIndex, entryIndex, 'reason', e.target.value)} className="col-span-3 w-full bg-white border border-gray-300 text-sm rounded-md p-1.5" />
                            <button onClick={() => removeEntry(dayIndex, entryIndex)} className="col-span-1 text-red-500 hover:text-red-700 justify-self-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={() => addEntry(dayIndex)} className="text-sm text-primary font-semibold mt-3">+ Ajouter une période</button>
              </div>  
            ))}
          </div>
        </main>

        <footer className="p-6 border-t bg-gray-50 flex justify-between items-center rounded-b-xl">
           <div>
              <span className="text-sm text-gray-500">Total calculé :</span>
              <span className="font-bold text-lg text-primary ml-2">{formatMinutesToHM(calculateTemplateTotal(formData))}</span>
           </div>
           <div className="flex gap-3">
            <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-text-dark font-semibold rounded-lg hover:bg-gray-300 transition-colors">Annuler</button>
            <button onClick={handleSave} className="py-2 px-4 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition-colors">Enregistrer</button>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default EditTemplateModal;