'use client';

import { useState, useEffect } from 'react';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import IEntree from '@/models/ientree';
import IJourCalendrier from '@/models/ijourcalendrier';
import { genererCalendrierAvecStartEtEnd } from '@/tools/calendar';
import { IEntreeCalendrier } from '@/models/ientreeCalendrier';

interface IGrosCalendrierProps {
  horaire: IEntree[];
  joursCalendrier: IJourCalendrier[];
  ajouterSemaine: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function GrosCalendrier({
  horaire,
  joursCalendrier,
  ajouterSemaine,
  isOpen,
  onClose,
}: IGrosCalendrierProps) {
  const localizer = momentLocalizer(moment);

  const [events, setEvents] = useState<IEntreeCalendrier[]>([]);
  const [defaultDate, setDefaultDate] = useState(new Date());

  useEffect(() => {
    const calendrier = genererCalendrierAvecStartEtEnd(
      horaire,
      joursCalendrier,
      ajouterSemaine
    );
    setEvents(calendrier);
    if (calendrier.length > 0) setDefaultDate(new Date(calendrier[0].start));
  }, [horaire, joursCalendrier, ajouterSemaine]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-5/6 h-5/6 p-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 font-bold"
          >
            ✕
          </button>
        </div>
        <div className="w-auto h-full p-6">
          <Calendar
            localizer={localizer}
            defaultDate={defaultDate}
            defaultView="month"
            events={events}
            startAccessor="start"
            endAccessor="end"
          />
        </div>
      </div>
    </div>
  );
}
