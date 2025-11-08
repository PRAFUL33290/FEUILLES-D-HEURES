
import { TimeEntry, Day, Week, WeekTemplate } from '../types';
import { parse, differenceInMinutes, getWeek, format, startOfMonth, endOfMonth, eachDayOfInterval, getISODay, addDays, parseISO, startOfISOWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

export const timeStringToMinutes = (time: string): number => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  } catch (e) {
    console.error(`Invalid time string: ${time}`);
    return 0;
  }
};

export const calculateEntryDuration = (entry: TimeEntry): number => {
  const startMinutes = timeStringToMinutes(entry.start);
  const endMinutes = timeStringToMinutes(entry.end);
  return endMinutes - startMinutes;
};

export const calculateDayTotal = (day: Day): number => {
  return day.entries.reduce((total, entry) => total + calculateEntryDuration(entry), 0);
};

export const calculateWeekTotal = (week: Week): number => {
  return week.days.reduce((total, day) => total + calculateDayTotal(day), 0);
};

export const calculateTemplateTotal = (template: WeekTemplate): number => {
    return template.days.reduce((total, day) => {
        const dayTotal = day.entries.reduce((daySum, entry) => daySum + calculateEntryDuration(entry as TimeEntry), 0);
        return total + dayTotal;
    }, 0);
};


export const formatMinutesToHM = (minutes: number): string => {
  if (minutes < 0) minutes = 0;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
};

export const formatMinutesToHours = (minutes: number): number => {
  return parseFloat((minutes / 60).toFixed(2));
};

export const getWeekNumber = (date: Date): number => {
    return getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 });
};

export const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
};

export const getDayOfWeek = (date: Date): number => {
    return getISODay(date); // Monday is 1, Sunday is 7
}

export const getMonday = (date: Date): Date => {
  return startOfISOWeek(date);
}

export const formatDate = (date: Date | string, formatString: string = 'PP'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString, { locale: fr });
}
