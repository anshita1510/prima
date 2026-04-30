'use client';

import { useState, useEffect, useCallback } from 'react';
import { AddEventModal } from '@/components/calendar/AddEventModal';
import { EventDetailsModal } from '@/components/calendar/EventDetailsModal';
import { calendarService } from '@/app/services/calendarService';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, Users, MapPin, RefreshCw } from 'lucide-react';

const EVENT_TYPE_STYLES: Record<string, { dot: string; badge: string; text: string }> = {
  MEETING: { dot: 'var(--accent-color)', badge: 'rgba(37,99,235,0.15)', text: 'var(--accent-color)' },
  DEADLINE: { dot: '#ef4444', badge: 'rgba(239,68,68,0.15)', text: '#ef4444' },
  MILESTONE: { dot: '#22c55e', badge: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  REMINDER: { dot: '#f59e0b', badge: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  FESTIVAL: { dot: 'var(--PRIMAry-color)', badge: 'var(--PRIMAry-subtle)', text: 'var(--PRIMAry-color)' },
  HOLIDAY: { dot: '#f97316', badge: 'rgba(249,115,22,0.15)', text: '#f97316' },
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
  attendees?: string[];
  location?: string;
}

// Indian public holidays & festivals 2025–2026
const FESTIVALS: CalendarEvent[] = [
  { id: 'f1', title: "New Year's Day", description: 'Public Holiday', date: '2025-01-01', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f2', title: 'Makar Sankranti', description: 'Hindu Festival', date: '2025-01-14', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f3', title: 'Republic Day', description: 'National Holiday', date: '2025-01-26', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f4', title: 'Maha Shivaratri', description: 'Hindu Festival', date: '2025-02-26', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f5', title: 'Holi', description: 'Festival of Colors', date: '2025-03-14', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f6', title: 'Good Friday', description: 'Christian Holiday', date: '2025-04-18', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f7', title: 'Easter Sunday', description: 'Christian Festival', date: '2025-04-20', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f8', title: 'May Day', description: 'Labour Day', date: '2025-05-01', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f9', title: 'Buddha Purnima', description: 'Birth of Buddha', date: '2025-05-12', time: 'All Day', type: 'FESTIVAL' },


  { id: 'f13', title: 'Guru Purnima', description: 'Festival of Teachers', date: '2025-07-10', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f14', title: 'Raksha Bandhan', description: 'Brother-Sister Festival', date: '2025-08-09', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f15', title: 'Independence Day', description: 'National Holiday', date: '2025-08-15', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f16', title: 'Janmashtami', description: 'Birth of Lord Krishna', date: '2025-08-16', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f17', title: 'Ganesh Chaturthi', description: 'Birth of Lord Ganesha', date: '2025-08-27', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f18', title: 'Navratri Begins', description: 'Nine Nights Festival', date: '2025-09-22', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f19', title: 'Gandhi Jayanti', description: 'National Holiday', date: '2025-10-02', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f20', title: 'Dussehra', description: 'Victory of Good over Evil', date: '2025-10-02', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f21', title: 'Diwali', description: 'Festival of Lights', date: '2025-10-20', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f22', title: 'Halloween', description: 'Western Festival', date: '2025-10-31', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f23', title: 'Guru Nanak Jayanti', description: 'Birth of Guru Nanak', date: '2025-11-05', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f24', title: "Children's Day", description: 'Celebration of Children', date: '2025-11-14', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f25', title: 'Christmas Day', description: 'Public Holiday', date: '2025-12-25', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f26', title: "New Year's Eve", description: 'Year End Celebration', date: '2025-12-31', time: 'All Day', type: 'FESTIVAL' },
  // 2026
  { id: 'f27', title: "New Year's Day", description: 'Public Holiday', date: '2026-01-01', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f28', title: 'Makar Sankranti', description: 'Hindu Festival', date: '2026-01-14', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f29', title: 'Republic Day', description: 'National Holiday', date: '2026-01-26', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f30', title: 'Maha Shivaratri', description: 'Hindu Festival', date: '2026-02-17', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f31', title: 'Holi', description: 'Festival of Colors', date: '2026-03-04', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f32', title: 'Good Friday', description: 'Christian Holiday', date: '2026-04-03', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f33', title: 'Mahavir Jayanti', description: 'Jain Festival', date: '2026-04-02', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f34', title: 'Hanuman Jayanti', description: 'Birth of Lord Hanuman', date: '2026-04-08', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f35', title: 'May Day', description: 'Labour Day', date: '2026-05-01', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f36', title: 'Buddha Purnima', description: 'Birth of Buddha', date: '2026-05-04', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f37', title: 'Eid al-Fitr', description: 'Islamic Festival', date: '2026-05-24', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f38', title: 'Eid al-Adha', description: 'Islamic Festival', date: '2026-07-31', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f39', title: 'Independence Day', description: 'National Holiday', date: '2026-08-15', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f40', title: 'Janmashtami', description: 'Birth of Lord Krishna', date: '2026-08-08', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f41', title: 'Ganesh Chaturthi', description: 'Birth of Lord Ganesha', date: '2026-08-19', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f42', title: 'Gandhi Jayanti', description: 'National Holiday', date: '2026-10-02', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f43', title: 'Diwali', description: 'Festival of Lights', date: '2026-10-11', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f44', title: "Children's Day", description: 'Celebration of Children', date: '2026-11-14', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f45', title: 'Guru Nanak Jayanti', description: 'Birth of Guru Nanak', date: '2026-11-24', time: 'All Day', type: 'FESTIVAL' },
  { id: 'f46', title: 'Christmas Day', description: 'Public Holiday', date: '2026-12-25', time: 'All Day', type: 'HOLIDAY' },
  { id: 'f47', title: "New Year's Eve", description: 'Year End Celebration', date: '2026-12-31', time: 'All Day', type: 'FESTIVAL' },
];

function mapApiEvent(e: any): CalendarEvent {
  const start = new Date(e.startDateTime);
  return {
    id: String(e.id),
    title: e.title,
    description: e.description || '',
    date: start.toISOString().split('T')[0],
    time: e.isAllDay ? 'All Day' : start.toTimeString().slice(0, 5),
    type: e.eventType || 'MEETING',
    location: e.location,
    attendees: e.attendees?.map((a: any) => a.attendee?.name || '') || [],
  };
}

function EventBadge({ type }: { type: string }) {
  const s = EVENT_TYPE_STYLES[type] || EVENT_TYPE_STYLES.MEETING;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
      style={{ backgroundColor: s.badge, color: s.text }}>
      {type.charAt(0) + type.slice(1).toLowerCase()}
    </span>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [apiEvents, setApiEvents] = useState<CalendarEvent[]>([]);
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoadError(false);
      const res = await calendarService.getEvents();
      const data: any[] = res.data || res || [];
      setApiEvents(Array.isArray(data) ? data.map(mapApiEvent) : []);
    } catch (err: any) {
      console.warn('Calendar events unavailable:', err?.message);
      setLoadError(true);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  // Merge festivals + API events + user-created events
  // Merge festivals + API events + user-created events without duplicates
  const allEvents = (() => {
    const map = new Map<string, CalendarEvent>();
    // Precedence: Custom > API > Festivals
    FESTIVALS.forEach(e => map.set(e.id, e));
    apiEvents.forEach(e => map.set(e.id, e));
    customEvents.forEach(e => map.set(e.id, e));
    return Array.from(map.values());
  })();

  const navigateMonth = (dir: 'prev' | 'next') => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
    setCurrentDate(d);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allEvents.filter(e => e.date === dateStr);
  };

  const upcomingEvents = allEvents
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    if (editingEvent) {
      setCustomEvents(prev => prev.map(e => e.id === newEvent.id ? newEvent : e));
      setEditingEvent(null);
    } else {
      setCustomEvents(prev => [...prev, newEvent]);
    }
    loadEvents();
  };

  const handleDeleteEvent = (eventId: string) => {
    setCustomEvents(prev => prev.filter(e => e.id !== eventId));
    setApiEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const today = new Date();
  const isFestivalOrHoliday = (type: string) => type === 'FESTIVAL' || type === 'HOLIDAY';

  return (
    <>
      <div className="w-full space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Enhanced Calendar</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage your schedule, events, and festivals</p>
            </div>
            <button
              onClick={() => { setSelectedDate(''); setEditingEvent(null); setIsAddEventModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--gradient-PRIMAry)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,40,217,0.3)' }}>
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>

          {/* Error banner */}
          {loadError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <span>⚠️</span>
              <span>Could not load events from server. Festivals are still shown.</span>
              <button onClick={loadEvents} className="ml-auto flex items-center gap-1 text-xs underline">
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Event Types</span>
            {Object.entries(EVENT_TYPE_STYLES).map(([key, s]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Calendar grid */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>

              {/* Month nav */}
              <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid var(--card-border)' }}>
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                  <Calendar className="w-4 h-4" style={{ color: 'var(--PRIMAry-color)' }} />
                  {currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigateMonth('prev')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigateMonth('next')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-7 mb-1">
                  {WEEK_DAYS.map(d => (
                    <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth().map((day, idx) => {
                    const dayEvents = day ? getEventsForDate(day) : [];
                    const isToday = day &&
                      today.getDate() === day &&
                      today.getMonth() === currentDate.getMonth() &&
                      today.getFullYear() === currentDate.getFullYear();

                    return (
                      <div key={idx}
                        className={`min-h-[72px] p-1.5 rounded-lg transition-colors ${day ? 'cursor-pointer' : 'pointer-events-none opacity-0'}`}
                        style={{
                          backgroundColor: isToday ? 'var(--PRIMAry-subtle)' : 'transparent',
                          border: isToday ? '1px solid var(--PRIMAry-color)' : '1px solid transparent',
                        }}
                        onMouseEnter={e => { if (day && !isToday) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-subtle)'; }}
                        onMouseLeave={e => { if (day && !isToday) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                        onClick={() => {
                          if (!day) return;
                          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          setSelectedDate(dateStr);
                          setEditingEvent(null);
                          setIsAddEventModalOpen(true);
                        }}>
                        {day && (
                          <>
                            <div className="text-sm font-medium mb-1 text-right"
                              style={{ color: isToday ? 'var(--PRIMAry-color)' : 'var(--text-color)' }}>
                              {day}
                            </div>
                            <div className="space-y-0.5">
                              {dayEvents.slice(0, 2).map(ev => {
                                const s = EVENT_TYPE_STYLES[ev.type] || EVENT_TYPE_STYLES.MEETING;
                                return (
                                  <div key={ev.id}
                                    className="text-xs px-1.5 py-0.5 rounded truncate font-medium"
                                    style={{ backgroundColor: s.badge, color: s.text, cursor: 'pointer' }}
                                    onClick={e => { e.stopPropagation(); setSelectedEvent(ev); setIsEventDetailsModalOpen(true); }}>
                                    {ev.type === 'FESTIVAL' && '🎉 '}{ev.type === 'HOLIDAY' && '🏖️ '}{ev.title}
                                  </div>
                                );
                              })}
                              {dayEvents.length > 2 && (
                                <div className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upcoming events */}
            <div className="rounded-2xl flex flex-col"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-color)' }}>Upcoming Events</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Your next scheduled events</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {upcomingEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Calendar className="w-8 h-8 opacity-30" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No upcoming events</p>
                  </div>
                ) : upcomingEvents.map(event => (
                  <div key={event.id}
                    className="p-3 rounded-xl cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)'}
                    onClick={() => { setSelectedEvent(event); setIsEventDetailsModalOpen(true); }}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-color)' }}>
                        {event.type === 'FESTIVAL' && '🎉 '}{event.type === 'HOLIDAY' && '🏖️ '}{event.title}
                      </p>
                      <EventBadge type={event.type} />
                    </div>
                    {event.description && (
                      <p className="text-xs mb-2 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      {event.time !== 'All Day' && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Clock className="w-3 h-3 flex-shrink-0" /><span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{event.location}</span>
                        </div>
                      )}
                      {!!event.attendees?.length && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Users className="w-3 h-3 flex-shrink-0" />
                          <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => { setIsAddEventModalOpen(false); setEditingEvent(null); }}
        onSuccess={handleAddEvent}
        selectedDate={selectedDate}
        editEvent={editingEvent as any}
      />

      <EventDetailsModal
        isOpen={isEventDetailsModalOpen}
        onClose={() => setIsEventDetailsModalOpen(false)}
        event={selectedEvent as any}
        onEdit={(ev: any) => { setEditingEvent(ev); setIsEventDetailsModalOpen(false); setIsAddEventModalOpen(true); }}
        onDelete={handleDeleteEvent}
        canEdit={!isFestivalOrHoliday(selectedEvent?.type || '')}
        canDelete={!isFestivalOrHoliday(selectedEvent?.type || '')}
      />
    </>
  );
}
