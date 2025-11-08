import { PublicHoliday } from '../types';

// Jours fériés et ponts pour 2025
export const PUBLIC_HOLIDAYS: PublicHoliday[] = [
    { date: '2025-01-01', name: "Jour de l'an", type: 'holiday' },
    { date: '2025-04-21', name: 'Lundi de Pâques', type: 'holiday' },
    { date: '2025-05-01', name: 'Fête du Travail', type: 'holiday' },
    { date: '2025-05-08', name: 'Victoire 1945', type: 'holiday' },
    { date: '2025-05-29', name: 'Ascension', type: 'holiday' },
    { date: '2025-05-30', name: "Pont de l'Ascension", type: 'bridge' },
    { date: '2025-06-09', name: 'Lundi de Pentecôte', type: 'holiday' },
    { date: '2025-07-14', name: 'Fête Nationale', type: 'holiday' },
    { date: '2025-08-15', name: 'Assomption', type: 'holiday' },
    { date: '2025-11-01', name: 'Toussaint', type: 'holiday' },
    { date: '2025-11-11', name: 'Armistice 1918', type: 'holiday' },
    { date: '2025-12-25', name: 'Noël', type: 'holiday' },
];
