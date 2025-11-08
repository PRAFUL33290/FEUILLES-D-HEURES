export interface User {
  id: string;
  name: string;
  team: 'ÉLÉMENTAIRE' | 'MATERNELLE';
  annualTarget: number;
}

export interface TimeEntry {
  id: string;
  start: string; // "HH:mm" format
  end: string; // "HH:mm" format
  description: string;
  reason?: string;
}

export interface Day {
  date: string; // ISO string "YYYY-MM-DD"
  entries: TimeEntry[];
}

export interface Week {
  id: string;
  userId: string;
  weekNumber: number;
  startDate: string; // ISO string "YYYY-MM-DD" of the Monday
  days: Day[];
  type: string;
  notes?: string;
  isHolidayWeek: boolean;
  templateId: string | null; // Can be detached from a template
}

export interface DayTemplate {
  dayOfWeek: number; // 1 for Monday, 2 for Tuesday... 7 for Sunday
  entries: Omit<TimeEntry, 'id'>[];
}

export interface WeekTemplate {
  id: string;
  userId: string;
  name: string;
  category: 'classique' | 'vacances';
  days: DayTemplate[];
}

export type Page = 'dashboard' | 'calendar' | 'heures' | 'reports' | 'holidays';

export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'holiday' | 'bridge';
}

export interface ManualAdjustment {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  hours: number; // Can be positive or negative
  reason: string;
}
