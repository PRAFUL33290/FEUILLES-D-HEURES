
import { Week } from '../types';
import { INITIAL_TEMPLATES } from './templatesData';
import { parseISO, addDays, format } from 'date-fns';

const generateWeekFromTemplate = (id: string, userId: string, weekNumber: number, startDate: string, templateName: string): Week => {
  const template = INITIAL_TEMPLATES.find(t => t.name === templateName && t.userId === userId);
  if (!template) throw new Error(`Template not found: ${templateName}`);

  const start = parseISO(startDate);
  const days = template.days.map(dayTemplate => {
    const date = addDays(start, dayTemplate.dayOfWeek - 1);
    return {
      date: date.toISOString().split('T')[0],
      entries: dayTemplate.entries.map((entry, index) => ({
        ...entry,
        id: `${id}-day${dayTemplate.dayOfWeek}-entry${index}`
      }))
    };
  });
  
  return {
    id,
    userId,
    weekNumber,
    startDate,
    days,
    type: template.name,
    isHolidayWeek: template.category === 'vacances',
    templateId: template.id
  };
};

// Data from September 2025 to current date (Nov 8, 2025)
export const INITIAL_WEEKS: Week[] = [
  // Septembre 2025
  generateWeekFromTemplate('julien-week-36-2025', 'julien', 36, '2025-09-01', 'Semaine Type (30h)'),
  generateWeekFromTemplate('julien-week-37-2025', 'julien', 37, '2025-09-08', 'Semaine Type (30h)'),
  generateWeekFromTemplate('julien-week-38-2025', 'julien', 38, '2025-09-15', 'Semaine Type (30h)'),
  generateWeekFromTemplate('julien-week-39-2025', 'julien', 39, '2025-09-22', 'Semaine Type (30h)'),
  generateWeekFromTemplate('julien-week-40-2025', 'julien', 40, '2025-09-29', 'Semaine Type (30h)'),
  
  // Octobre 2025
  generateWeekFromTemplate('julien-week-41-2025', 'julien', 41, '2025-10-06', 'Semaine Type (30h)'),
  generateWeekFromTemplate('julien-week-42-2025', 'julien', 42, '2025-10-13', 'Semaine Type (30h)'),
  generateWeekFromTemplate('julien-week-43-2025', 'julien', 43, '2025-10-20', 'Vacances Toussaint - S1'),
  generateWeekFromTemplate('julien-week-44-2025', 'julien', 44, '2025-10-27', 'Vacances Toussaint - S2'),

  // Novembre 2025
  generateWeekFromTemplate('julien-week-45-2025', 'julien', 45, '2025-11-03', 'Semaine Type (30h)'),
];