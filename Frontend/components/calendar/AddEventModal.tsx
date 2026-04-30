'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Bell, X } from 'lucide-react';
import api from '@/lib/axios';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'MEETING' | 'DEADLINE' | 'MILESTONE' | 'REMINDER' | 'FESTIVAL' | 'HOLIDAY';
  attendees?: string[];
  location?: string;
}

interface Attendee {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (event: any) => void;
  selectedDate?: string;
  editEvent?: CalendarEvent | null;
}

const EVENT_TYPES = [
  { value: 'MEETING', label: 'Meeting', icon: '👥' },
  { value: 'DEADLINE', label: 'Deadline', icon: '⏰' },
  { value: 'MILESTONE', label: 'Milestone', icon: '🏁' },
  { value: 'REMINDER', label: 'Reminder', icon: '🔔' },
  { value: 'FESTIVAL', label: 'Festival', icon: '🎉' },
  { value: 'HOLIDAY', label: 'Holiday', icon: '🏖️' },
];

const inputStyle = {
  backgroundColor: 'var(--input-bg)',
  border: '1px solid var(--card-border)',
  color: 'var(--text-color)',
  borderRadius: '10px',
  padding: '9px 12px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
} as const;

const sectionStyle = {
  backgroundColor: 'var(--bg-subtle)',
  border: '1px solid var(--card-border)',
  borderRadius: '12px',
  padding: '16px',
} as const;

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  marginBottom: '6px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
};

export function AddEventModal({ isOpen, onClose, onSuccess, selectedDate, editEvent }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: selectedDate || '',
    time: '',
    type: 'MEETING' as CalendarEvent['type'],
    location: '',
  });
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditMode = !!editEvent;

  useEffect(() => {
    if (!isOpen) return;
    loadCompanyMembers();
    if (editEvent) {
      setFormData({
        title: editEvent.title,
        description: editEvent.description,
        date: editEvent.date,
        time: editEvent.time === 'All Day' ? '' : editEvent.time,
        type: editEvent.type,
        location: editEvent.location || '',
      });
    } else if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  }, [isOpen, selectedDate, editEvent]);

  const loadCompanyMembers = async () => {
    try {
      const res = await api.get('/api/employees');
      const list = res.data?.data || res.data || [];
      setAvailableUsers(
        list
          .filter((e: any) => e.user?.role !== 'SUPER_ADMIN')
          .map((e: any) => ({
            id: e.id,
            name: e.name || 'Unknown',
            email: e.user?.email || '',
            role: e.user?.role || e.designation || '',
          }))
      );
    } catch {
      setAvailableUsers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return setError('Event title is required');
    if (!formData.date) return setError('Event date is required');
    setLoading(true);
    setError('');
    try {
      const startDateTime = formData.time ? `${formData.date}T${formData.time}:00` : `${formData.date}T00:00:00`;
      const endDateTime = formData.time ? `${formData.date}T${formData.time}:00` : `${formData.date}T23:59:59`;
      const payload = {
        title: formData.title,
        description: formData.description,
        startDateTime,
        endDateTime,
        isAllDay: !formData.time,
        eventType: formData.type,
        location: formData.location,
        attendeeIds: selectedAttendees,
      };
      const res = isEditMode && editEvent?.id
        ? await api.put(`/api/calendar/events/${editEvent.id}`, payload)
        : await api.post('/api/calendar/events', payload);
      const saved = res.data.data;
      onSuccess({
        id: String(saved.id),
        title: saved.title,
        description: saved.description || '',
        date: formData.date,
        time: formData.time || 'All Day',
        type: formData.type,
        location: formData.location,
        attendees: selectedAttendees
          .map(id => availableUsers.find(u => u.id === id)?.name || '')
          .filter(Boolean),
      });
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', date: '', time: '', type: 'MEETING', location: '' });
    setSelectedAttendees([]);
    setError('');
  };

  const handleClose = () => { resetForm(); onClose(); };
  const toggle = (id: number) =>
    setSelectedAttendees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-lg)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: 'var(--gradient-PRIMAry)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold text-white">
              {isEditMode ? 'Edit Event' : 'Add New Event'}
            </h2>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: 'white' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          {/* Event Type */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Event Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map(et => (
                <button key={et.value} type="button"
                  onClick={() => setFormData(f => ({ ...f, type: et.value as CalendarEvent['type'] }))}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: formData.type === et.value ? 'var(--PRIMAry-subtle)' : 'var(--input-bg)',
                    border: `1px solid ${formData.type === et.value ? 'var(--PRIMAry-color)' : 'var(--card-border)'}`,
                    color: formData.type === et.value ? 'var(--PRIMAry-color)' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}>
                  <span>{et.icon}</span><span>{et.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Event Title *</label>
            <input value={formData.title}
              onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Q2 Planning Meeting"
              disabled={loading}
              style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={formData.description}
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="Add agenda, notes, or context..."
              rows={3} disabled={loading}
              style={{ ...inputStyle, resize: 'none' }} />
          </div>

          {/* Date & Time */}
          <div style={sectionStyle}>
            <label style={labelStyle}>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 inline" /> Date & Time</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ ...labelStyle, marginBottom: 4 }}>Date *</label>
                <input type="date" value={formData.date}
                  onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                  disabled={loading} style={inputStyle} />
              </div>
              <div>
                <label style={{ ...labelStyle, marginBottom: 4 }}>Time</label>
                <input type="time" value={formData.time}
                  onChange={e => setFormData(f => ({ ...f, time: e.target.value }))}
                  disabled={loading} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 inline" /> Location</span>
            </label>
            <input value={formData.location}
              onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g., Conference Room A or Zoom"
              disabled={loading} style={inputStyle} />
          </div>

          {/* Attendees */}
          <div style={sectionStyle}>
            <div className="flex items-center justify-between mb-2">
              <label style={labelStyle}>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 inline" /> Attendees</span>
              </label>
              {availableUsers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAttendees.length === availableUsers.length) {
                      setSelectedAttendees([]);
                    } else {
                      setSelectedAttendees(availableUsers.map(u => u.id));
                    }
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-all"
                  style={{
                    backgroundColor: 'var(--PRIMAry-subtle)',
                    color: 'var(--PRIMAry-color)',
                    border: '1px solid var(--PRIMAry-color)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--PRIMAry-color)';
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--PRIMAry-subtle)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--PRIMAry-color)';
                  }}>
                  {selectedAttendees.length === availableUsers.length ? 'Unselect All' : 'Select All'}
                </button>
              )}
            </div>
            {availableUsers.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No company members found</p>
            ) : (
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {availableUsers.map(user => (
                  <label key={user.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors"
                    style={{ backgroundColor: selectedAttendees.includes(user.id) ? 'var(--PRIMAry-subtle)' : 'transparent' }}
                    onMouseEnter={e => { if (!selectedAttendees.includes(user.id)) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-color)'; }}
                    onMouseLeave={e => { if (!selectedAttendees.includes(user.id)) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}>
                    <input type="checkbox" checked={selectedAttendees.includes(user.id)}
                      onChange={() => toggle(user.id)}
                      style={{ accentColor: 'var(--PRIMAry-color)', width: 16, height: 16 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-color)' }}>
                        {user.name}
                        {user.role && <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>({user.role})</span>}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {selectedAttendees.length > 0 && (
              <div className="mt-3 pt-3 flex flex-wrap gap-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                {selectedAttendees.map(id => {
                  const u = availableUsers.find(x => x.id === id);
                  return u ? (
                    <span key={id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: 'var(--PRIMAry-subtle)', color: 'var(--PRIMAry-color)', border: '1px solid var(--PRIMAry-color)' }}>
                      {u.name}
                      <X className="w-3 h-3 cursor-pointer ml-0.5" onClick={() => toggle(id)} />
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Email notice */}
          {selectedAttendees.length > 0 && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-color)', opacity: 0.9 }}>
              <Bell className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-color)' }} />
              <p className="text-sm" style={{ color: 'var(--text-color)' }}>
                Selected attendees will receive an email notification.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid var(--card-border)', backgroundColor: 'var(--bg-subtle)' }}>
          <button type="button" onClick={handleClose} disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'var(--gradient-PRIMAry)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(109,40,217,0.3)' }}>
            {loading
              ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />{isEditMode ? 'Updating...' : 'Creating...'}</>
              : isEditMode ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
