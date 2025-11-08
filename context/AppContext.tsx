import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Page, User, Week, WeekTemplate, ManualAdjustment } from '../types';
import { USERS } from '../constants/usersData';
import { INITIAL_TEMPLATES } from '../constants/templatesData';
import { INITIAL_WEEKS } from '../constants/mockData';
import { parseISO, addDays, format } from 'date-fns';

interface AppContextType {
  users: User[];
  activeUser: User | null;
  weeks: Week[];
  templates: WeekTemplate[];
  manualAdjustments: ManualAdjustment[];
  activePage: Page;
  setActiveUser: (userId: string) => void;
  addWeek: (week: Week) => void;
  updateWeek: (updatedWeek: Week) => void;
  addTemplate: (template: WeekTemplate) => void;
  updateTemplate: (updatedTemplate: WeekTemplate) => void;
  duplicateTemplate: (templateId: string) => void;
  deleteTemplate: (templateId: string) => void;
  addAdjustment: (adjustment: Omit<ManualAdjustment, 'id' | 'userId'>) => void;
  deleteAdjustment: (adjustmentId: string) => void;
  setActivePage: (page: Page) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, fallback: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return fallback;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(USERS);
  const [activeUser, setActiveUserState] = useState<User | null>(() => getInitialState<User | null>('activeUser', users[0]));
  const [weeks, setWeeks] = useState<Week[]>(() => getInitialState<Week[]>('weeks', INITIAL_WEEKS));
  const [templates, setTemplates] = useState<WeekTemplate[]>(() => getInitialState<WeekTemplate[]>('templates', INITIAL_TEMPLATES));
  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustment[]>(() => getInitialState<ManualAdjustment[]>('manualAdjustments', []));
  const [activePage, setActivePage] = useState<Page>('dashboard');

  useEffect(() => {
    localStorage.setItem('activeUser', JSON.stringify(activeUser));
  }, [activeUser]);

  useEffect(() => {
    localStorage.setItem('weeks', JSON.stringify(weeks));
  }, [weeks]);

  useEffect(() => {
    localStorage.setItem('templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('manualAdjustments', JSON.stringify(manualAdjustments));
  }, [manualAdjustments]);

  const setActiveUser = (userId: string) => {
    const user = users.find(u => u.id === userId) || null;
    setActiveUserState(user);
  };

  const addWeek = (week: Week) => {
    setWeeks(prevWeeks => [...prevWeeks, week]);
  };

  const updateWeek = (updatedWeek: Week) => {
    setWeeks(prevWeeks => prevWeeks.map(week => (week.id === updatedWeek.id ? updatedWeek : week)));
  };

  const addTemplate = (template: WeekTemplate) => {
    setTemplates(prev => [...prev, template]);
  };

  const updateTemplate = (updatedTemplate: WeekTemplate) => {
    setTemplates(prevTemplates => 
      prevTemplates.map(template => 
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    );

    setWeeks(prevWeeks =>
      prevWeeks.map(week => {
        if (week.templateId === updatedTemplate.id) {
          const monday = parseISO(week.startDate);
          const newDays = updatedTemplate.days.map(dayTpl => {
            const date = addDays(monday, dayTpl.dayOfWeek - 1);
            return {
              date: format(date, 'yyyy-MM-dd'),
              entries: dayTpl.entries.map(entry => ({
                ...entry,
                id: `entry-${Date.now()}-${Math.random()}`
              }))
            };
          });

          return {
            ...week,
            type: updatedTemplate.name,
            isHolidayWeek: updatedTemplate.category === 'vacances',
            days: newDays,
          };
        }
        return week;
      })
    );
  };

  const duplicateTemplate = (templateId: string) => {
    const templateToCopy = templates.find(t => t.id === templateId);
    if (templateToCopy && activeUser) {
      const newTemplate = {
        ...templateToCopy,
        id: `template-${activeUser.id}-${Date.now()}`,
        name: `${templateToCopy.name} (Copie)`
      };
      addTemplate(newTemplate);
    }
  };

  const deleteTemplate = (templateId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce modèle ?")) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      // Detach weeks from this template
      setWeeks(prev => prev.map(w => w.templateId === templateId ? { ...w, templateId: null } : w));
    }
  };

  const addAdjustment = (adjustment: Omit<ManualAdjustment, 'id' | 'userId'>) => {
    if (activeUser) {
      const newAdjustment: ManualAdjustment = {
        id: `adj-${activeUser.id}-${Date.now()}`,
        userId: activeUser.id,
        ...adjustment
      };
      setManualAdjustments(prev => [newAdjustment, ...prev]);
    }
  };

  const deleteAdjustment = (adjustmentId: string) => {
    setManualAdjustments(prev => prev.filter(adj => adj.id !== adjustmentId));
  };

  const value = useMemo(() => ({
    users,
    activeUser,
    weeks,
    templates,
    manualAdjustments,
    activePage,
    setActiveUser,
    addWeek,
    updateWeek,
    addTemplate,
    updateTemplate,
    duplicateTemplate,
    deleteTemplate,
    addAdjustment,
    deleteAdjustment,
    setActivePage,
  }), [users, activeUser, weeks, templates, manualAdjustments, activePage]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
