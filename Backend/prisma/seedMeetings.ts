/**
 * Demo meetings as CalendarEvents (eventType MEETING).
 * Tagged in description for idempotent cleanup per company on re-seed.
 */
import type { PrismaClient } from "@prisma/client";

export const SEED_MEETING_TAG = "[[seed:meeting:v1]]";

type Slot = {
  title: string;
  body: string;
  daysFromNow: number;
  hour: number;
  durationMinutes: number;
};

const MEETING_BLUEPRINTS: Slot[] = [
  {
    title: "Sprint review — prior week",
    body: "Completed stories and carry-over (seeded past meeting).",
    daysFromNow: -4,
    hour: 15,
    durationMinutes: 45,
  },
  {
    title: "All-hands recap",
    body: "Past company update session.",
    daysFromNow: -11,
    hour: 10,
    durationMinutes: 60,
  },
  {
    title: "Weekly leadership sync",
    body: "Blockers, metrics, and cross-team priorities.",
    daysFromNow: 1,
    hour: 10,
    durationMinutes: 45,
  },
  {
    title: "Engineering backlog grooming",
    body: "Size stories for next sprint.",
    daysFromNow: 2,
    hour: 14,
    durationMinutes: 60,
  },
  {
    title: "1:1 — performance check-in",
    body: "Career goals and feedback cadence.",
    daysFromNow: 4,
    hour: 11,
    durationMinutes: 30,
  },
  {
    title: "Product roadmap review",
    body: "Stakeholder alignment on Q priorities.",
    daysFromNow: 6,
    hour: 9,
    durationMinutes: 90,
  },
  {
    title: "HR policies Q&A",
    body: "Open forum on leave and remote work.",
    daysFromNow: 8,
    hour: 15,
    durationMinutes: 45,
  },
  {
    title: "Customer escalation post-mortem",
    body: "Action items and owner assignment.",
    daysFromNow: 10,
    hour: 16,
    durationMinutes: 60,
  },
  {
    title: "Quarterly OKR retrospective",
    body: "What shipped, what's at risk.",
    daysFromNow: 12,
    hour: 10,
    durationMinutes: 75,
  },
  {
    title: "Vendor / tooling evaluation",
    body: "Shortlist and decision timeline.",
    daysFromNow: 15,
    hour: 13,
    durationMinutes: 45,
  },
];

function atLocalDayHour(base: Date, daysFromNow: number, hour: number, minute: number): Date {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export async function seedDemoMeetings(prisma: PrismaClient): Promise<void> {
  console.log("📅 Seeding demo meetings (CalendarEvent MEETING)…");

  const companies = await prisma.company.findMany({
    where: { isActive: true },
    select: { id: true, code: true },
  });

  const now = new Date();
  let total = 0;

  for (const company of companies) {
    await prisma.calendarEvent.deleteMany({
      where: {
        description: { contains: SEED_MEETING_TAG },
        organizer: { companyId: company.id },
      },
    });

    const employees = await prisma.employee.findMany({
      where: { companyId: company.id, isActive: true },
      orderBy: { id: "asc" },
      take: 12,
    });

    if (employees.length === 0) continue;

    const organizer = employees[0]!;
    const pool = employees.slice(1).map((e) => e.id);

    for (const slot of MEETING_BLUEPRINTS) {
      const start = atLocalDayHour(now, slot.daysFromNow, slot.hour, 0);
      const end = new Date(start.getTime() + slot.durationMinutes * 60_000);
      const attendeeIds = pool.slice(0, Math.min(3, pool.length));

      await prisma.calendarEvent.create({
        data: {
          title: slot.title,
          description: `${slot.body}\n\n${SEED_MEETING_TAG}`,
          startDateTime: start,
          endDateTime: end,
          isAllDay: false,
          eventType: "MEETING",
          organizerId: organizer.id,
          attendees:
            attendeeIds.length > 0
              ? {
                  create: attendeeIds.map((attendeeId) => ({
                    attendeeId,
                    status: "accepted",
                  })),
                }
              : undefined,
        },
      });
      total += 1;
    }
  }

  console.log(`✅ Created ${total} demo meetings across ${companies.length} companies (${SEED_MEETING_TAG})`);
}
