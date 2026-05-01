import { PrismaClient, Role } from '@prisma/client';
import { NotificationService } from './notification.service';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

interface CreateEventDTO {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  isAllDay?: boolean;
  eventType: string;
  referenceId?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
  attendeeIds?: number[];
  location?: string;
}

interface UpdateEventDTO {
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  isAllDay?: boolean;
  eventType?: string;
  location?: string;
}

interface GetEventsFilter {
  startDate?: string;
  endDate?: string;
  eventType?: string;
}

export class CalendarService {
  private notificationService: NotificationService;
  private mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  constructor() {
    this.notificationService = new NotificationService();
  }

  /** Organizer, company ADMIN, or SUPER_ADMIN may update/delete an event. */
  private async assertCanManageEvent(userId: number, eventId: number): Promise<void> {
    const actorUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyId: true },
    });
    if (!actorUser) throw new Error('User not found');

    const actorEmployee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    });

    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: { organizer: { select: { companyId: true } } },
    });
    if (!event) throw new Error('Event not found');

    if (actorEmployee && event.organizerId === actorEmployee.id) return;
    if (actorUser.role === Role.SUPER_ADMIN) return;
    if (
      actorUser.role === Role.ADMIN &&
      actorUser.companyId != null &&
      actorUser.companyId === event.organizer.companyId
    ) {
      return;
    }

    throw new Error('Only the organizer or a company admin can modify this meeting');
  }

  private sendEventEmail(to: string, subject: string, html: string) {
    this.mailer.sendMail({
      from: `"PRIMA Calendar" <${process.env.SMTP_USER}>`,
      to, subject, html,
    }).catch(err => console.error('📧 Calendar email failed:', err.message));
  }

  async createEvent(userId: number, data: CreateEventDTO) {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: { user: true, company: true }
    });

    if (!employee) throw new Error('Employee not found');

    const event = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
        isAllDay: data.isAllDay || false,
        eventType: data.eventType,
        referenceId: data.referenceId,
        isRecurring: data.isRecurring || false,
        recurrenceRule: data.recurrenceRule,
        organizerId: employee.id,
        attendees: data.attendeeIds?.length ? {
          create: data.attendeeIds.map(attendeeId => ({ attendeeId, status: 'pending' }))
        } : undefined
      },
      include: {
        organizer: { include: { user: true } },
        attendees: { include: { attendee: { include: { user: true } } } }
      }
    });

    // Notification Logic
    const isCompanyWide = data.eventType === 'HOLIDAY' || data.eventType === 'FESTIVAL';

    if (isCompanyWide) {
      // Notify ALL company members
      setTimeout(async () => {
        try {
          const companyMembers = await prisma.employee.findMany({
            where: { companyId: employee.companyId, isActive: true },
            include: { user: { select: { email: true } } }
          });

          const recipientIds = companyMembers.map(m => m.id);
          const eventDate = new Date(data.startDateTime).toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });

          // In-app notification for everyone
          await this.notificationService.createNotification({
            title: `New Company ${data.eventType === 'HOLIDAY' ? 'Holiday' : 'Festival'}`,
            message: `${data.title} scheduled for ${new Date(data.startDateTime).toLocaleDateString()}`,
            type: 'TASK_ASSIGNED',
            referenceId: event.id,
            referenceType: 'calendar_event',
            createdById: employee.id,
            recipientIds
          });

          // Emails for everyone
          for (const member of companyMembers) {
            if (!member.user?.email) continue;
            this.sendEventEmail(
              member.user.email,
              `📅 ${data.eventType}: ${data.title}`,
              `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
                <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:24px;border-radius:8px;margin-bottom:24px;">
                  <h1 style="color:#fff;margin:0;font-size:22px;">📅 New ${data.eventType === 'HOLIDAY' ? 'Holiday' : 'Festival'}</h1>
                  <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">A new company-wide event has been added</p>
                </div>
                <div style="background:#fff;padding:20px;border-radius:8px;border:1px solid #e5e7eb;">
                  <h2 style="color:#111827;margin:0 0 12px;">${data.title}</h2>
                  ${data.description ? `<p style="color:#6b7280;margin:0 0 16px;">${data.description}</p>` : ''}
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <div style="display:flex;align-items:center;gap:8px;color:#374151;">
                      <span>📆</span><span>${eventDate}</span>
                    </div>
                    ${data.location ? `<div style="display:flex;align-items:center;gap:8px;color:#374151;"><span>📍</span><span>${data.location}</span></div>` : ''}
                  </div>
                </div>
                <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">PRIMA — Company Calendar Notification</p>
              </div>
              `
            );
          }
          console.log(`📧 Company-wide emails sent to ${companyMembers.length} members`);
        } catch (err: any) {
          console.error('📧 Company-wide notification failed:', err.message);
        }
      }, 0);
    } else {
      // Regular event: Notify only selected attendees
      if (data.attendeeIds && data.attendeeIds.length > 0) {
        await this.notificationService.createNotification({
          title: 'New Event Invitation',
          message: `You have been invited to "${data.title}"`,
          type: 'TASK_ASSIGNED',
          referenceId: event.id,
          referenceType: 'calendar_event',
          createdById: employee.id,
          recipientIds: data.attendeeIds
        });

        // Optional: Also email selected attendees (currently the service only has a broad email logic)
        // For brevity, we'll focus on the user's request for company-wide holidays.
      }
    }

    return event;
  }

  async getEvents(userId: number, filters: GetEventsFilter) {
    const employee = await prisma.employee.findUnique({
      where: { userId }
    });

    // Return empty array instead of throwing if no employee record yet
    if (!employee) return [];

    const where: any = {
      OR: [
        { organizerId: employee.id },
        { attendees: { some: { attendeeId: employee.id } } },
        // Also show company-wide events
        { organizer: { companyId: employee.companyId } }
      ]
    };

    // Overlap with [startDate, endDate] if both provided (event intersects window)
    if (filters.startDate && filters.endDate) {
      const rangeStart = new Date(filters.startDate);
      const rangeEnd = new Date(filters.endDate);
      where.AND = [
        { startDateTime: { lte: rangeEnd } },
        { endDateTime: { gte: rangeStart } },
      ];
    }

    if (filters.eventType) {
      where.eventType = filters.eventType;
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        organizer: {
          include: { user: true }
        },
        attendees: {
          include: {
            attendee: {
              include: { user: true }
            }
          }
        }
      },
      orderBy: {
        startDateTime: 'asc'
      }
    });

    return events;
  }

  async getEventById(eventId: number) {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          include: { user: true }
        },
        attendees: {
          include: {
            attendee: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  async updateEvent(eventId: number, userId: number, data: UpdateEventDTO) {
    await this.assertCanManageEvent(userId, eventId);

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        title: data.title,
        description: data.description,
        startDateTime: data.startDateTime ? new Date(data.startDateTime) : undefined,
        endDateTime: data.endDateTime ? new Date(data.endDateTime) : undefined,
        isAllDay: data.isAllDay,
        eventType: data.eventType
      },
      include: {
        organizer: {
          include: { user: true }
        },
        attendees: {
          include: {
            attendee: {
              include: { user: true }
            }
          }
        }
      }
    });

    const actingEmployee = await prisma.employee.findUnique({ where: { userId } });
    const attendeeIds = updatedEvent.attendees.map(a => a.attendeeId);
    if (actingEmployee && attendeeIds.length > 0) {
      await this.notificationService.createNotification({
        title: 'Event Updated',
        message: `"${updatedEvent.title}" has been updated`,
        type: 'TASK_UPDATED',
        referenceId: updatedEvent.id,
        referenceType: 'calendar_event',
        createdById: actingEmployee.id,
        recipientIds: attendeeIds
      });
    }

    return updatedEvent;
  }

  async deleteEvent(eventId: number, userId: number) {
    const actingEmployee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    });

    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: { attendees: true },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    await this.assertCanManageEvent(userId, eventId);

    const attendeeIds = event.attendees.map(a => a.attendeeId);
    if (actingEmployee && attendeeIds.length > 0) {
      await this.notificationService.createNotification({
        title: 'Event Cancelled',
        message: `"${event.title}" has been cancelled`,
        type: 'TASK_UPDATED',
        referenceId: event.id,
        referenceType: 'calendar_event',
        createdById: actingEmployee.id,
        recipientIds: attendeeIds
      });
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId }
    });

    return { message: 'Event deleted successfully' };
  }

  async addAttendees(eventId: number, attendeeIds: number[]) {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const attendees = await prisma.calendarEventAttendee.createMany({
      data: attendeeIds.map(attendeeId => ({
        eventId,
        attendeeId,
        status: 'pending'
      })),
      skipDuplicates: true
    });

    // Send notifications
    await this.notificationService.createNotification({
      title: 'New Event Invitation',
      message: `You have been invited to "${event.title}"`,
      type: 'TASK_ASSIGNED',
      referenceId: event.id,
      referenceType: 'calendar_event',
      createdById: event.organizerId,
      recipientIds: attendeeIds
    });

    return attendees;
  }

  async updateAttendeeStatus(eventId: number, attendeeId: number, status: string) {
    const attendee = await prisma.calendarEventAttendee.updateMany({
      where: {
        eventId,
        attendeeId
      },
      data: {
        status
      }
    });

    return attendee;
  }
}
