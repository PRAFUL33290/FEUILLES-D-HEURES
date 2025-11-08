import { WeekTemplate } from '../types';

const HOLIDAY_WEEK_DAYS = [
  { dayOfWeek: 1, entries: [{ start: '07:30', end: '13:00', description: 'Matin' }, { start: '13:30', end: '17:00', description: 'Aprem' }] },
  { dayOfWeek: 2, entries: [{ start: '07:30', end: '13:00', description: 'Matin' }, { start: '13:30', end: '17:00', description: 'Aprem' }] },
  { dayOfWeek: 3, entries: [{ start: '07:30', end: '13:00', description: 'Matin' }, { start: '13:30', end: '17:00', description: 'Aprem' }] },
  { dayOfWeek: 4, entries: [{ start: '07:30', end: '13:00', description: 'Matin' }, { start: '13:30', end: '17:00', description: 'Aprem' }] },
  { dayOfWeek: 5, entries: [{ start: '07:30', end: '13:00', description: 'Matin' }, { start: '13:30', end: '17:00', description: 'Aprem' }] },
];

export const INITIAL_TEMPLATES: WeekTemplate[] = [
  {
    id: 'julien-template-1',
    userId: 'julien',
    name: 'Semaine Type (30h)',
    category: 'classique',
    days: [
      { dayOfWeek: 1, entries: [{ start: '07:10', end: '08:30', description: 'Accueil du matin' }, { start: '11:55', end: '13:50', description: 'Midi' }, { start: '15:00', end: '16:00', description: 'Prépa' }, { start: '16:30', end: '18:30', description: 'Accueil du soir' }] },
      { dayOfWeek: 2, entries: [{ start: '11:55', end: '13:50', description: 'Midi' }, { start: '15:00', end: '16:00', description: 'Réunion ALSH' }, { start: '16:30', end: '18:45', description: 'Accueil du soir' }] },
      { dayOfWeek: 3, entries: [{ start: '07:10', end: '13:00', description: 'Mercredi Matin' }, { start: '13:30', end: '16:40', description: 'Mercredi Aprem' }] },
      { dayOfWeek: 4, entries: [{ start: '11:55', end: '13:50', description: 'Midi' }, { start: '15:00', end: '16:00', description: 'Prépa/Réunion' }, { start: '16:30', end: '18:15', description: 'Accueil du soir' }] },
      { dayOfWeek: 5, entries: [{ start: '07:10', end: '08:30', description: 'Accueil du matin' }, { start: '11:55', end: '13:50', description: 'Midi' }, { start: '16:00', end: '16:20', description: 'Prépa goûter' }, { start: '16:30', end: '17:50', description: 'Accueil du soir' }] },
    ]
  },
  {
    id: 'julien-template-2',
    userId: 'julien',
    name: 'Vacances Toussaint - S1',
    category: 'vacances',
    days: [
      { dayOfWeek: 1, entries: [{ start: '07:10', end: '13:00', description: 'Matin' }, { start: '13:30', end: '16:40', description: 'Aprem' }] },
      { dayOfWeek: 2, entries: [{ start: '07:10', end: '13:00', description: 'Matin' }, { start: '13:30', end: '16:40', description: 'Aprem' }] },
      { dayOfWeek: 3, entries: [{ start: '07:10', end: '13:00', description: 'Matin' }, { start: '13:30', end: '16:40', description: 'Aprem' }] },
      { dayOfWeek: 4, entries: [{ start: '07:10', end: '13:00', description: 'Matin' }, { start: '13:30', end: '16:40', description: 'Aprem' }] },
      { dayOfWeek: 5, entries: [{ start: '07:10', end: '13:00', description: 'Matin' }, { start: '13:30', end: '16:40', description: 'Aprem' }] },
    ]
  },
  {
    id: 'julien-template-3',
    userId: 'julien',
    name: 'Vacances Toussaint - S2',
    category: 'vacances',
    days: HOLIDAY_WEEK_DAYS
  },
  {
    id: 'julien-template-4',
    userId: 'julien',
    name: 'Vacances de Noël',
    category: 'vacances',
    days: HOLIDAY_WEEK_DAYS
  },
  {
    id: 'julien-template-5',
    userId: 'julien',
    name: 'Vacances d\'Hiver',
    category: 'vacances',
    days: HOLIDAY_WEEK_DAYS
  },
  {
    id: 'julien-template-6',
    userId: 'julien',
    name: 'Vacances de Pâques',
    category: 'vacances',
    days: HOLIDAY_WEEK_DAYS
  },
  {
    id: 'julien-template-7',
    userId: 'julien',
    name: 'Grandes Vacances (Juillet)',
    category: 'vacances',
    days: HOLIDAY_WEEK_DAYS
  },
  {
    id: 'julien-template-8',
    userId: 'julien',
    name: 'Grandes Vacances (Août)',
    category: 'vacances',
    days: HOLIDAY_WEEK_DAYS
  }
];