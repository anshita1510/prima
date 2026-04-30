'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Edit, Trash2, User, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const EVENT_TYPE_STYLES: Record<string, { badge: string; text: string; sectionBg: string; sectionBorder: string; icon: string }> = {
  MEETING: { badge: 'rgba(37,99,235,0.15)', text: 'var(--accent-color)', sectionBg: 'var(--accent-subtle)', sectionBorder: 'rgba(37,99,235,0.2)', icon: 'var(--accent-color)' },
  DEADLINE: { badge: 'rgba(239,68,68,0.15)', text: '#ef4444', sectionBg: 'rgba(239,68,68,0.06)', sectionBorder: 'rgba(239,68,68,0.2)', icon: '#ef4444' },
  MILESTONE: { badge: 'rgba(34,197,94,0.15)', text: '#22c55e', sectionBg: 'rgba(34,197,94,0.06)', sectionBorder: 'rgba(34,197,94,0.2)', icon: '#22c55e' },
  REMINDER: { badge: 'rgba(245,158,11,0.15)', text: '#f59e0b', sectionBg: 'rgba(245,158,11,0.06)', sectionBorder: 'rgba(245,158,11,0.2)', icon: '#f59e0b' },
  FESTIVAL: { badge: 'var(--PRIMAry-subtle)', text: 'var(--PRIMAry-color)', sectionBg: 'var(--PRIMAry-subtle)', sectionBorder: 'rgba(109,40,217,0.2)', icon: 'var(--PRIMAry-color)' },
  HOLIDAY: { badge: 'rgba(249,115,22,0.15)', text: '#f97316', sectionBg: 'rgba(249,115,22,0.06)', sectionBorder: 'rgba(249,115,22,0.2)', icon: '#f97316' },
};

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'MEETING' | 'DEADLINE' | 'MILESTONE' | 'REMINDER' | 'FESTIVAL' | 'HOLIDAY';
  attendees?: string[];
  location?: string;
  isPublicHoliday?: boolean;
  createdBy?: string;
}

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function EventDetailsModal({
  isOpen, onClose, event, onEdit, onDelete,
  canEdit = true, canDelete = true,
}: EventDetailsModalProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!event) return null;

  const s = EVENT_TYPE_STYLES[event.type] || EVENT_TYPE_STYLES.MEETING;
  const isSystemEvent = event.type === 'FESTIVAL' || event.type === 'HOLIDAY';
  const showEditDelete = !isSystemEvent && (canEdit || canDelete);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(event.id);
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-[500px]"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-color)' }}>

          {/* Header */}
          <DialogHeader
            className="-mx-6 -mt-6 px-6 py-4 rounded-t-lg"
            style={{ background: 'var(--gradient-PRIMAry)' }}>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-white text-xl flex items-center gap-2 flex-1">
                <Calendar className="w-5 h-5" />
                Event Details
              </DialogTitle>
              <button
                onClick={onClose}
                className="rounded-full p-1 transition-colors"
                style={{ color: 'white' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4 px-2 py-4">

            {/* Title & Type */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold flex-1" style={{ color: 'var(--text-color)' }}>
                  {event.type === 'HOLIDAY' && '🏖️ '}
                  {event.type === 'FESTIVAL' && '🎉 '}
                  {event.title}
                </h2>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ml-2"
                  style={{ backgroundColor: s.badge, color: s.text }}>
                  {event.type.charAt(0) + event.type.slice(1).toLowerCase()}
                </span>
              </div>
              {event.description && (
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
              )}
            </div>

            {/* Date & Time */}
            <div className="rounded-lg p-4" style={{ backgroundColor: s.sectionBg, border: `1px solid ${s.sectionBorder}` }}>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm" style={{ color: 'var(--text-color)' }}>
                <Calendar className="w-4 h-4" style={{ color: s.icon }} />
                Date &amp; Time
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{event.time === 'All Day' ? 'All Day Event' : event.time}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm" style={{ color: 'var(--text-color)' }}>
                  <MapPin className="w-4 h-4" style={{ color: '#22c55e' }} />
                  Location
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{event.location}</p>
              </div>
            )}

            {/* Attendees */}
            {!!event.attendees?.length && (
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--PRIMAry-subtle)', border: '1px solid rgba(109,40,217,0.2)' }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm" style={{ color: 'var(--text-color)' }}>
                  <Users className="w-4 h-4" style={{ color: 'var(--PRIMAry-color)' }} />
                  Attendees ({event.attendees.length})
                </h3>
                <div className="space-y-2">
                  {event.attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--PRIMAry-subtle)', border: '1px solid var(--card-border)' }}>
                        <User className="w-4 h-4" style={{ color: 'var(--PRIMAry-color)' }} />
                      </div>
                      <span>{attendee}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Created By */}
            {event.createdBy && (
              <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm" style={{ color: 'var(--text-color)' }}>
                  <User className="w-4 h-4" style={{ color: '#f59e0b' }} />
                  Created By
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{event.createdBy}</p>
              </div>
            )}

            {/* Actions */}
            {showEditDelete && (
              <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
                {canDelete && (
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(true)}
                    style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.06)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                    <Trash2 className="w-4 h-4 mr-2" />Delete
                  </Button>
                )}
                {canEdit && (
                  <Button
                    onClick={() => { onEdit(event); onClose(); }}
                    style={{ background: 'var(--gradient-PRIMAry)', color: 'white', border: 'none' }}>
                    <Edit className="w-4 h-4 mr-2" />Edit Event
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-color)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--text-color)' }}>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--text-muted)' }}>
              Are you sure you want to delete &quot;{event.title}&quot;? This action cannot be undone.
              {!!event.attendees?.length && (
                <span className="block mt-2 font-medium" style={{ color: '#f59e0b' }}>
                  ⚠️ {event.attendees.length} attendee(s) will be notified about the cancellation.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--card-border)' }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}>
              {deleting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Deleting...
                </span>
              ) : 'Delete Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
