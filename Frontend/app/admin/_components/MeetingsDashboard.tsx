'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from './PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Video, Plus, Calendar, Clock, Users, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { AddEventModal } from '@/components/calendar/AddEventModal';
import { authService } from '@/app/services/authService';
import {
  meetingsService,
  MeetingEvent,
  stripSeedMeetingFooter,
} from '@/app/services/meetings.service';

type ModalCalendarEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'MEETING' | 'DEADLINE' | 'MILESTONE' | 'REMINDER' | 'FESTIVAL' | 'HOLIDAY';
  location?: string;
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toModalEditEvent(ev: MeetingEvent): ModalCalendarEvent {
  const start = new Date(ev.startDateTime);
  const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  const time = ev.isAllDay ? '' : `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  return {
    id: String(ev.id),
    title: ev.title,
    description: stripSeedMeetingFooter(ev.description) || '',
    date,
    time,
    type: 'MEETING',
    location: '',
  };
}

function formatRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const day = s.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const t1 = s.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const t2 = e.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${t1} – ${t2}`;
}

function organizerLabel(ev: MeetingEvent) {
  const u = ev.organizer?.user;
  if (!u) return '—';
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return name || u.email || '—';
}

export default function MeetingsDashboard() {
  const [meetings, setMeetings] = useState<MeetingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actor, setActor] = useState<{
    role: string;
    employeeId?: number;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editShape, setEditShape] = useState<ModalCalendarEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MeetingEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProfile = useCallback(async () => {
    const res = await authService.getCurrentUser();
    if (res.success && res.user) {
      setActor({
        role: res.user.role,
        employeeId: res.user.employeeId != null ? Number(res.user.employeeId) : undefined,
      });
    }
  }, []);

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await meetingsService.listMeetings();
    if (res.success) {
      setMeetings(res.data.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()));
    } else {
      setMeetings([]);
      setError(res.message || 'Could not load meetings');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const now = Date.now();

  const { upcoming, past } = useMemo(() => {
    const up: MeetingEvent[] = [];
    const pa: MeetingEvent[] = [];
    for (const m of meetings) {
      if (new Date(m.endDateTime).getTime() >= now) up.push(m);
      else pa.push(m);
    }
    pa.sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
    return { upcoming: up, past: pa };
  }, [meetings, now]);

  const canManage = (ev: MeetingEvent) => {
    if (!actor) return false;
    if (actor.role === 'SUPER_ADMIN' || actor.role === 'ADMIN') return true;
    if (actor.employeeId != null && ev.organizer?.id === actor.employeeId) return true;
    return false;
  };

  const openCreate = () => {
    setEditShape(null);
    setModalOpen(true);
  };

  const openEdit = (ev: MeetingEvent) => {
    setEditShape(toModalEditEvent(ev));
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadMeetings();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await meetingsService.deleteMeeting(deleteTarget.id);
      setDeleteTarget(null);
      await loadMeetings();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const renderList = (items: MeetingEvent[], empty: string) => {
    if (loading) {
      return (
        <p className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading meetings…
        </p>
      );
    }
    if (items.length === 0) {
      return (
        <p className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          {empty}
        </p>
      );
    }
    return (
      <ul className="space-y-3">
        {items.map((ev) => (
          <li
            key={ev.id}
            className="rounded-xl border p-4 transition-colors"
            style={{
              borderColor: 'var(--card-border)',
              backgroundColor: 'var(--bg-subtle)',
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-[var(--text-color)]">{ev.title}</h3>
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                    Meeting
                  </Badge>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    {formatRange(ev.startDateTime, ev.endDateTime)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {ev.isAllDay ? 'All day' : `${Math.max(15, Math.round((new Date(ev.endDateTime).getTime() - new Date(ev.startDateTime).getTime()) / 60000))} min`}
                  </span>
                </p>
                {stripSeedMeetingFooter(ev.description) ? (
                  <p className="mt-2 line-clamp-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {stripSeedMeetingFooter(ev.description)}
                  </p>
                ) : null}
                <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Organizer: <span className="font-medium text-[var(--text-color)]">{organizerLabel(ev)}</span>
                  {ev.attendees && ev.attendees.length > 0 ? (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {ev.attendees.length} invited
                    </span>
                  ) : null}
                </p>
              </div>
              {canManage(ev) ? (
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => openEdit(ev)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => setDeleteTarget(ev)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <PageHeader
        title="Meetings"
        subtitle="Schedule one-on-ones and team meetings. Data comes from your company calendar (seeded + live)."
        showBackButton={false}
      />

      <div
        className="mt-6 rounded-2xl border p-4 md:p-6"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Video className="h-4 w-4 text-[var(--PRIMAry-color)]" />
            Company meetings (API + seed)
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => loadMeetings()}
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1"
              style={{ backgroundColor: 'var(--PRIMAry-color)', color: '#fff' }}
              onClick={openCreate}
            >
              <Plus className="h-4 w-4" />
              Schedule meeting
            </Button>
          </div>
        </div>

        {error ? (
          <div
            className="mb-4 rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: 'rgba(239,68,68,0.35)',
              backgroundColor: 'rgba(239,68,68,0.08)',
              color: '#b91c1c',
            }}
          >
            {error}
          </div>
        ) : null}

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4 w-full justify-start overflow-x-auto bg-[var(--bg-subtle)]">
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="all">All ({meetings.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">{renderList(upcoming, 'No upcoming meetings in this window.')}</TabsContent>
          <TabsContent value="past">{renderList(past, 'No past meetings in this window.')}</TabsContent>
          <TabsContent value="all">{renderList(meetings, 'No meetings found — run db seed or schedule one.')}</TabsContent>
        </Tabs>
      </div>

      <AddEventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditShape(null);
        }}
        onSuccess={handleModalSuccess}
        editEvent={editShape}
        meetingOnly
      />

      <Dialog open={deleteTarget != null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel meeting?</DialogTitle>
            <DialogDescription>
              {deleteTarget ? `"${deleteTarget.title}" will be removed from the calendar.` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Keep
            </Button>
            <Button type="button" variant="destructive" disabled={deleting} onClick={confirmDelete}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
