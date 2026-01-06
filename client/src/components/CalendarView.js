import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import './CalendarView.css';

const CalendarView = ({ events, onEventClick }) => {
  // Ensure events is an array
  const safeEvents = Array.isArray(events) ? events : [];

  const formattedEvents = safeEvents.map(event => {
    // Handle date formatting carefully
    // fecha_evento usually comes as ISO string (e.g., 2023-10-25T00:00:00.000Z) or YYYY-MM-DD
    let datePart = event.fecha_evento;
    if (typeof datePart === 'string' && datePart.includes('T')) {
      datePart = datePart.split('T')[0];
    }
    
    // Construct valid ISO string for FullCalendar
    const start = datePart + (event.hora_evento ? `T${event.hora_evento}` : '');

    return {
      id: event.id,
      title: event.nombre,
      start: start,
      extendedProps: { ...event },
      classNames: event.activo ? ['event-active'] : ['event-inactive']
    };
  });

  return (
    <div className="calendar-view-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        locale={esLocale}
        events={formattedEvents}
        eventClick={(info) => {
          if (onEventClick) {
             onEventClick(info.event.extendedProps);
          }
        }}
        height="auto"
        dayMaxEvents={true}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false
        }}
      />
    </div>
  );
};

export default CalendarView;
