import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { calculateTemplateTotal, formatMinutesToHM } from '../utils/timeUtils';
import { WeekTemplate } from '../types';
import EditTemplateModal from '../components/modals/EditTemplateModal';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const DuplicateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;


const TemplateCard: React.FC<{ template: WeekTemplate; onEdit: (template: WeekTemplate) => void; onDuplicate: (id: string) => void; onDelete: (id: string) => void; }> = ({ template, onEdit, onDuplicate, onDelete }) => {
    const totalMinutes = calculateTemplateTotal(template);
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-text-dark">{template.name}</h3>
                     <div className="flex items-center gap-2">
                        <button onClick={() => onDuplicate(template.id)} title="Dupliquer" className="text-gray-400 hover:text-primary"><DuplicateIcon /></button>
                        <button onClick={() => onDelete(template.id)} title="Supprimer" className="text-gray-400 hover:text-red-500"><DeleteIcon /></button>
                    </div>
                </div>
                <span className={`px-2 py-0.5 mt-1 inline-block rounded-full text-xs font-medium ${template.category === 'vacances' ? 'bg-orange-100 text-accent-orange' : 'bg-purple-100 text-primary'}`}>
                    {template.category}
                </span>
            </div>
            <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total hebdo.</span>
                    <span className="font-bold text-lg text-primary">{formatMinutesToHM(totalMinutes)}</span>
                </div>
                 <button onClick={() => onEdit(template)} className="w-full mt-3 text-sm font-semibold text-primary hover:bg-primary/10 py-2 rounded-lg transition-colors">Modifier</button>
            </div>
        </div>
    );
}

const TemplatesPage: React.FC = () => {
    const { activeUser, templates, updateTemplate, addTemplate, manualAdjustments, addAdjustment, deleteAdjustment, duplicateTemplate, deleteTemplate } = useAppContext();
    const [editingTemplate, setEditingTemplate] = useState<WeekTemplate | null>(null);
    
    const [adjSign, setAdjSign] = useState<'+' | '-'>('+');
    const [adjHours, setAdjHours] = useState('0');
    const [adjMinutes, setAdjMinutes] = useState('0');
    const [adjDate, setAdjDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [adjReason, setAdjReason] = useState('');

    const userTemplates = templates.filter(t => t.userId === activeUser?.id);
    const userAdjustments = manualAdjustments.filter(adj => adj.userId === activeUser?.id);
    
    const handleEditTemplate = (template: WeekTemplate) => {
        setEditingTemplate(template);
    };
    
    const handleCloseModal = () => {
        setEditingTemplate(null);
    };
    
    const handleSaveTemplate = (templateToSave: WeekTemplate) => {
        updateTemplate(templateToSave);
        handleCloseModal();
    };

    const handleAddAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        const hours = parseInt(adjHours, 10);
        const minutes = parseInt(adjMinutes, 10);

        if (!activeUser || isNaN(hours) || isNaN(minutes) || !adjReason || !adjDate || (hours === 0 && minutes === 0)) {
            return;
        }

        const totalDecimalHours = hours + (minutes / 60);
        const signedHours = adjSign === '-' ? -totalDecimalHours : totalDecimalHours;
        
        addAdjustment({ date: adjDate, hours: signedHours, reason: adjReason });

        setAdjSign('+');
        setAdjHours('0');
        setAdjMinutes('0');
        setAdjReason('');
    };

    return (
        <>
            <div className="space-y-8">
                <header>
                    <h1 className="text-3xl font-poppins font-bold text-text-dark">Mes Heures</h1>
                    <p className="text-gray-500 mt-1">Ajustez vos heures ou modifiez vos modèles de semaine.</p>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold text-text-dark mb-4">Ajustement Manuel</h2>
                    <form onSubmit={handleAddAdjustment} className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
                        <div className="flex-1 min-w-0">
                            <label htmlFor="adj-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" id="adj-date" value={adjDate} onChange={e => setAdjDate(e.target.value)} required className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5" />
                        </div>
                        <div className="flex-shrink-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                            <div className="flex items-center gap-1">
                                <select value={adjSign} onChange={e => setAdjSign(e.target.value as '+' | '-')} className="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 pr-2 font-semibold">
                                    <option value="+">+</option>
                                    <option value="-">-</option>
                                </select>
                                <select value={adjHours} onChange={e => setAdjHours(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5">
                                    {[...Array(13).keys()].map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                                <span className="text-sm text-gray-500">h</span>
                                <select value={adjMinutes} onChange={e => setAdjMinutes(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5">
                                    {[...Array(60).keys()].map(m => <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>)}
                                </select>
                                <span className="text-sm text-gray-500">m</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <label htmlFor="adj-reason" className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
                            <input type="text" id="adj-reason" value={adjReason} onChange={e => setAdjReason(e.target.value)} required placeholder="Réunion, heure sup..." className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5" />
                        </div>
                        <button type="submit" className="bg-primary text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:bg-primary/90 transition-colors w-full md:w-auto">Ajouter l'ajustement</button>
                    </form>
                </div>

                {userAdjustments.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-lg font-semibold text-text-dark mb-4">Historique des ajustements</h2>
                        <ul className="divide-y divide-gray-200">
                            {userAdjustments.slice(0, 5).map(adj => (
                                <li key={adj.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{adj.reason}</p>
                                        <p className="text-sm text-gray-500">{format(parseISO(adj.date), 'd MMMM yyyy', { locale: fr })}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-semibold text-lg ${adj.hours > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {adj.hours > 0 ? '+' : ''}{adj.hours.toFixed(2).replace('.',',')}h
                                        </span>
                                        <button onClick={() => deleteAdjustment(adj.id)} className="text-gray-400 hover:text-red-500"><DeleteIcon /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}


                <div>
                    <h2 className="text-xl font-semibold text-text-dark mb-4">Modèles Classiques</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userTemplates.filter(t => t.category === 'classique').map(template => (
                            <TemplateCard key={template.id} template={template} onEdit={handleEditTemplate} onDuplicate={duplicateTemplate} onDelete={deleteTemplate} />
                        ))}
                    </div>
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold text-text-dark mb-4">Modèles de Vacances</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userTemplates.filter(t => t.category === 'vacances').map(template => (
                            <TemplateCard key={template.id} template={template} onEdit={handleEditTemplate} onDuplicate={duplicateTemplate} onDelete={deleteTemplate} />
                        ))}
                    </div>
                </div>

            </div>
            {editingTemplate && (
                <EditTemplateModal 
                    template={editingTemplate}
                    isCreating={false}
                    onClose={handleCloseModal}
                    onSave={handleSaveTemplate}
                />
            )}
        </>
    );
};

export default TemplatesPage;