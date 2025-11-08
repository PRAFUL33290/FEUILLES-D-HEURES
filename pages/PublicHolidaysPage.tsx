import React from 'react';
import { PUBLIC_HOLIDAYS } from '../constants/holidaysData';
import { PublicHoliday } from '../types';
import { parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PublicHolidaysPage: React.FC = () => {
  const currentYear = PUBLIC_HOLIDAYS.length > 0 
    ? parseISO(PUBLIC_HOLIDAYS[0].date).getFullYear() 
    : new Date().getFullYear();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-poppins font-bold text-text-dark">Jours Fériés & Ponts</h1>
        <p className="text-gray-500 mt-1">Liste des jours fériés et ponts scolaires pour l'année {currentYear}.</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flow-root">
          <ul role="list" className="-my-4 divide-y divide-gray-200">
            {PUBLIC_HOLIDAYS.map((holiday: PublicHoliday) => (
              <li key={holiday.date} className="flex items-center py-4 space-x-4">
                <div className="flex-shrink-0 h-14 w-14 flex flex-col items-center justify-center bg-primary/10 text-primary rounded-lg">
                    <span className="text-sm font-bold uppercase -mb-1">{format(parseISO(holiday.date), 'MMM', { locale: fr })}</span>
                    <span className="text-2xl font-bold">{format(parseISO(holiday.date), 'd')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-md font-semibold text-text-dark truncate">{holiday.name}</p>
                    {holiday.type === 'bridge' && (
                      <span className="px-2 py-0.5 inline-block rounded-full text-xs font-medium bg-orange-100 text-accent-orange">
                        Pont
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 capitalize">{format(parseISO(holiday.date), 'EEEE d MMMM yyyy', { locale: fr })}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PublicHolidaysPage;