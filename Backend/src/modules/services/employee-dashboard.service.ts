import { prisma } from '../../config/db';
import { TaskStatus } from '@prisma/client';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function monthShort(d: Date): string {
  return d.toLocaleString('en-US', { month: 'short' });
}

function weekLabel(start: Date): string {
  const m = start.toLocaleString('en-US', { month: 'short' });
  return `${m} ${start.getDate()}`;
}

export class EmployeeDashboardService {
  async getEmployeeDashboard(employeeId: number, companyId: number) {
    const now = new Date();
    const weekStart = startOfWeekMonday(now);
    const weekEnd = addDays(weekStart, 7);

    const assignedTasks = await prisma.task.findMany({
      where: {
        assignedToId: employeeId,
        isActive: true,
        project: { companyId },
      },
      select: {
        id: true,
        status: true,
        dueDate: true,
        title: true,
        completedAt: true,
        createdAt: true,
      },
    });

    const activeAssigned = assignedTasks.filter((t) => t.status !== TaskStatus.CANCELLED);
    const myTasks = activeAssigned.length;

    let completed = 0;
    let inProgress = 0;
    let overdue = 0;
    for (const t of activeAssigned) {
      if (t.status === TaskStatus.COMPLETED) completed += 1;
      else if (t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.IN_REVIEW) inProgress += 1;
      if (
        t.dueDate &&
        new Date(t.dueDate) < now &&
        t.status !== TaskStatus.COMPLETED &&
        t.status !== TaskStatus.CANCELLED
      ) {
        overdue += 1;
      }
    }
    const completionRate = myTasks > 0 ? Math.round((completed / myTasks) * 1000) / 10 : 0;

    const attendanceRows = await prisma.attendance.findMany({
      where: {
        employeeId,
        companyId,
        date: { gte: weekStart, lt: weekEnd },
      },
      select: { date: true, workHours: true, status: true },
    });

    const hoursByDow = new Map<number, number>();
    for (const r of attendanceRows) {
      const dow = new Date(r.date).getDay();
      const monBased = dow === 0 ? 6 : dow - 1;
      const h = r.workHours != null ? Number(r.workHours) : 0;
      hoursByDow.set(monBased, (hoursByDow.get(monBased) ?? 0) + h);
    }

    const weeklyAttendance = DAY_LABELS.map((day, i) => ({
      day,
      hours: Math.round((hoursByDow.get(i) ?? 0) * 10) / 10,
      status: i < 5 ? 'Present' : 'Weekend',
    }));

    const timeEntriesWeek = await prisma.taskTimeEntry.findMany({
      where: {
        employeeId,
        startTime: { gte: weekStart, lt: weekEnd },
      },
      select: { duration: true, startTime: true, endTime: true },
    });

    let minutesWeek = 0;
    for (const e of timeEntriesWeek) {
      if (e.duration != null) minutesWeek += e.duration;
      else if (e.endTime) {
        minutesWeek += Math.max(0, Math.round((new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / 60000));
      }
    }
    const hoursThisWeek = Math.round((minutesWeek / 60) * 10) / 10;

    const monthlyProgress: { week: string; completed: number; assigned: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const ws = addDays(weekStart, -7 * w);
      const we = addDays(ws, 7);
      const [doneCount, assignedCount] = await Promise.all([
        prisma.task.count({
          where: {
            assignedToId: employeeId,
            project: { companyId },
            isActive: true,
            status: TaskStatus.COMPLETED,
            completedAt: { gte: ws, lt: we },
          },
        }),
        prisma.task.count({
          where: {
            assignedToId: employeeId,
            project: { companyId },
            isActive: true,
            createdAt: { gte: ws, lt: we },
          },
        }),
      ]);
      monthlyProgress.push({
        week: weekLabel(ws),
        completed: doneCount,
        assigned: Math.max(assignedCount, doneCount),
      });
    }

    const productivityTrend: { month: string; tasks: number; hours: number }[] = [];
    for (let m = 5; m >= 0; m--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const next = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
      const [tasksDone, timeAgg] = await Promise.all([
        prisma.task.count({
          where: {
            assignedToId: employeeId,
            project: { companyId },
            isActive: true,
            status: TaskStatus.COMPLETED,
            completedAt: { gte: ref, lt: next },
          },
        }),
        prisma.taskTimeEntry.aggregate({
          where: {
            employeeId,
            startTime: { gte: ref, lt: next },
          },
          _sum: { duration: true },
        }),
      ]);
      const mins = timeAgg._sum.duration ?? 0;
      productivityTrend.push({
        month: monthShort(ref),
        tasks: tasksDone,
        hours: Math.round((mins / 60) * 10) / 10,
      });
    }

    const recentDone = await prisma.task.findMany({
      where: {
        assignedToId: employeeId,
        project: { companyId },
        status: TaskStatus.COMPLETED,
        completedAt: { not: null },
      },
      orderBy: { completedAt: 'desc' },
      take: 6,
      select: { id: true, title: true, completedAt: true },
    });

    const recentActivity = recentDone.map((t) => ({
      id: String(t.id),
      type: 'task_completed' as const,
      title: 'Task completed',
      description: t.title,
      timestamp: t.completedAt ? this.timeAgo(new Date(t.completedAt)) : '',
      user: 'You',
    }));

    return {
      summary: {
        myTasks,
        completedTasks: completed,
        inProgressTasks: inProgress,
        overdueTasks: overdue,
        hoursThisWeek: hoursThisWeek || Math.round(weeklyAttendance.reduce((s, d) => s + d.hours, 0) * 10) / 10,
        completionRate,
      },
      weeklyAttendance,
      taskDistribution: [
        { name: 'Completed', value: completed, color: '#10b981' },
        { name: 'In Progress', value: inProgress, color: '#3b82f6' },
        { name: 'Overdue', value: overdue, color: '#ef4444' },
      ],
      monthlyProgress,
      productivityTrend,
      recentActivity,
    };
  }

  private timeAgo(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const m = Math.floor(diffMs / 60000);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 48) return `${h} hour${h === 1 ? '' : 's'} ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  }
}
