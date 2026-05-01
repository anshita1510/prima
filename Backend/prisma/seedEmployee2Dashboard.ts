/**
 * Demo employee "employee2 ji" — tasks, two projects, ~10 weeks weekday attendance,
 * leave applications (pending/approved/rejected), and time entries for /user flows.
 * Idempotent: DASH-EMP2 / EMP2-PORTAL codes, `[SEED_UI_LEAVE]` reasons, employee2@mailinator.com.
 */
import {
  PrismaClient,
  Role,
  Status,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  ProjectRole,
  AttendanceStatus,
  DepartmentType,
  Designation,
  LeaveType,
  LeaveStatus,
} from "@prisma/client";

const PROJECT_CODE = "DASH-EMP2";
const SECOND_PROJECT_CODE = "EMP2-PORTAL";
const USER_EMAIL = "employee2@mailinator.com";
const EMPLOYEE_CODE = "EMP-E02JI";
/** Matches leave.controller stripSeedUiLeaveReason — UI shows text after this prefix. */
const SEED_LEAVE_PREFIX = "[SEED_UI_LEAVE]";

function mondayStartLocal(d = new Date()): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dayAtNoon(base: Date, addDays: number): Date {
  const x = new Date(base);
  x.setDate(x.getDate() + addDays);
  x.setHours(12, 0, 0, 0);
  return x;
}

function atNoon(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

function addCalendarDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Must match attendance check-in/out (`setHours(0,0,0,0)`). */
function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mondayOnOrBefore(d: Date): Date {
  const x = atNoon(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

function collectLeaveCalendarKeys(start: Date, end: Date): Set<string> {
  const keys = new Set<string>();
  let x = atNoon(start);
  const endAt = atNoon(end);
  while (x.getTime() <= endAt.getTime()) {
    keys.add(ymd(x));
    x = addCalendarDays(x, 1);
  }
  return keys;
}

export async function seedEmployee2Dashboard(
  prisma: PrismaClient,
  passwordHash: string
): Promise<void> {
  const company = await prisma.company.findUnique({
    where: { code: "PRIMA" },
  });

  if (!company) {
    console.warn("⚠️ PRIMA company missing — skip employee2 dashboard seed.");
    return;
  }

  const itDept =
    (await prisma.department.findFirst({
      where: {
        companyId: company.id,
        name: "IT",
      },
    })) ||
    (await prisma.department.create({
      data: {
        name: "IT",
        type: DepartmentType.IT,
        companyId: company.id,
      },
    }));

  const user = await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: {
      firstName: "employee2",
      lastName: "ji",
      phone: "+919000000002",
      designation: "Software Engineer",
      role: Role.EMPLOYEE,
      status: Status.ACTIVE,
      isActive: true,
      isVerified: true,
      companyId: company.id,
      password: passwordHash,
    },
    create: {
      email: USER_EMAIL,
      firstName: "employee2",
      lastName: "ji",
      phone: "+919000000002",
      designation: "Software Engineer",
      password: passwordHash,
      role: Role.EMPLOYEE,
      status: Status.ACTIVE,
      isActive: true,
      isVerified: true,
      companyId: company.id,
    },
  });

  // `userId` is unique — upsert by userId. If another employee still holds our code, rename it (avoid FK deletes).
  const codeConflict = await prisma.employee.findFirst({
    where: { employeeCode: EMPLOYEE_CODE, userId: { not: user.id } },
  });
  if (codeConflict) {
    await prisma.employee.update({
      where: { id: codeConflict.id },
      data: { employeeCode: `${EMPLOYEE_CODE}-was-${codeConflict.id}` },
    });
  }

  const employee = await prisma.employee.upsert({
    where: { userId: user.id },
    update: {
      employeeCode: EMPLOYEE_CODE,
      companyId: company.id,
      departmentId: itDept.id,
      name: "employee2 ji",
      designation: Designation.SOFTWARE_ENGINEER,
      isActive: true,
    },
    create: {
      userId: user.id,
      companyId: company.id,
      departmentId: itDept.id,
      name: "employee2 ji",
      designation: Designation.SOFTWARE_ENGINEER,
      employeeCode: EMPLOYEE_CODE,
      isActive: true,
    },
  });

  const approverEmployee = await prisma.employee.findFirst({
    where: {
      companyId: company.id,
      user: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER] } },
    },
    orderBy: { id: "asc" },
  });

  let project = await prisma.project.findUnique({
    where: { code: PROJECT_CODE },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: "Employee2 dashboard sandbox",
        description: "Seeded tasks & time for employee dashboard demo",
        companyId: company.id,
        departmentId: itDept.id,
        ownerId: employee.id,
        code: PROJECT_CODE,
        status: ProjectStatus.ACTIVE,
        startDate: new Date(),
        members: {
          connect: [{ id: employee.id }],
        },
      },
    });
  }

  await prisma.projectMember.upsert({
    where: {
      projectId_employeeId: {
        projectId: project.id,
        employeeId: employee.id,
      },
    },
    update: {
      isActive: true,
    },
    create: {
      projectId: project.id,
      employeeId: employee.id,
      isActive: true,
    },
  });

  const portalOwnerId = approverEmployee?.id ?? employee.id;
  let portalProject = await prisma.project.findUnique({
    where: { code: SECOND_PROJECT_CODE },
  });

  if (!portalProject) {
    portalProject = await prisma.project.create({
      data: {
        name: "Customer portal rollout",
        description:
          "Seeded demo project — employee2 is a member; tasks visible under My Projects.",
        companyId: company.id,
        departmentId: itDept.id,
        ownerId: portalOwnerId,
        code: SECOND_PROJECT_CODE,
        status: ProjectStatus.ACTIVE,
        startDate: addCalendarDays(atNoon(new Date()), -45),
        progressPercentage: 42,
      },
    });
  } else {
    await prisma.project.update({
      where: { id: portalProject.id },
      data: {
        isActive: true,
        departmentId: itDept.id,
        ownerId: portalOwnerId,
        status: ProjectStatus.ACTIVE,
      },
    });
  }

  await prisma.projectMember.upsert({
    where: {
      projectId_employeeId: {
        projectId: portalProject.id,
        employeeId: employee.id,
      },
    },
    update: { isActive: true, role: ProjectRole.MEMBER },
    create: {
      projectId: portalProject.id,
      employeeId: employee.id,
      isActive: true,
      role: ProjectRole.MEMBER,
    },
  });

  await prisma.task.deleteMany({
    where: {
      projectId: portalProject.id,
      code: { startsWith: "EMP2-P-" },
    },
  });

  await prisma.task.create({
    data: {
      title: "Portal SSO integration",
      description: `Seeded task on ${SECOND_PROJECT_CODE}`,
      projectId: portalProject.id,
      assignedToId: employee.id,
      createdById: portalOwnerId,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      code: "EMP2-P-01",
      dueDate: addCalendarDays(atNoon(new Date()), 14),
      startDate: addCalendarDays(atNoon(new Date()), -10),
      progressPercentage: 55,
    },
  });

  await prisma.task.create({
    data: {
      title: "Release checklist",
      description: `Seeded task on ${SECOND_PROJECT_CODE}`,
      projectId: portalProject.id,
      assignedToId: employee.id,
      createdById: employee.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      code: "EMP2-P-02",
      dueDate: addCalendarDays(atNoon(new Date()), 21),
      startDate: atNoon(new Date()),
      progressPercentage: 0,
    },
  });

  await prisma.taskTimeEntry.deleteMany({
    where: {
      employeeId: employee.id,
      description: {
        contains: "SEED_EMP2_TIME",
      },
    },
  });

  await prisma.task.deleteMany({
    where: {
      projectId: project.id,
      code: {
        startsWith: "EMP2-T-",
      },
    },
  });

  const now = new Date();
  const msPerDay = 86400000;
  const createdOffsets = [26, 22, 19, 14, 11, 9, 7, 5, 3, 2, 1, 0];

  type TSpec = {
    title: string;
    status: TaskStatus;
    dueInDays: number;
    completedDaysAgo?: number;
  };

  const specs: TSpec[] = [
    {
      title: "API contract review",
      status: TaskStatus.COMPLETED,
      dueInDays: -10,
      completedDaysAgo: 12,
    },
    {
      title: "Unit tests — auth module",
      status: TaskStatus.COMPLETED,
      dueInDays: -8,
      completedDaysAgo: 10,
    },
    {
      title: "Wire employee dashboard",
      status: TaskStatus.COMPLETED,
      dueInDays: -5,
      completedDaysAgo: 8,
    },
    {
      title: "Fix pagination bug",
      status: TaskStatus.COMPLETED,
      dueInDays: -4,
      completedDaysAgo: 35,
    },
    {
      title: "Docs: onboarding flow",
      status: TaskStatus.COMPLETED,
      dueInDays: -3,
      completedDaysAgo: 62,
    },
    {
      title: "Refactor task DTO",
      status: TaskStatus.COMPLETED,
      dueInDays: -2,
      completedDaysAgo: 45,
    },
    {
      title: "Smoke test staging",
      status: TaskStatus.COMPLETED,
      dueInDays: -1,
      completedDaysAgo: 20,
    },
    {
      title: "Accessibility pass",
      status: TaskStatus.COMPLETED,
      dueInDays: 0,
      completedDaysAgo: 3,
    },
    {
      title: "Sprint demo slides",
      status: TaskStatus.IN_PROGRESS,
      dueInDays: 3,
    },
    {
      title: "Performance profiling",
      status: TaskStatus.IN_PROGRESS,
      dueInDays: 5,
    },
    {
      title: "Integrate charts API",
      status: TaskStatus.IN_REVIEW,
      dueInDays: 7,
    },
    {
      title: "Legacy import script",
      status: TaskStatus.TODO,
      dueInDays: -2,
    },
  ];

  const taskIds: number[] = [];

  for (let i = 0; i < specs.length; i++) {
    const s = specs[i]!;
    const createdAt = new Date(now.getTime() - createdOffsets[i]! * msPerDay);
    const dueDate = new Date(now.getTime() + s.dueInDays * msPerDay);

    const completedAt =
      s.status === TaskStatus.COMPLETED && s.completedDaysAgo != null
        ? new Date(now.getTime() - s.completedDaysAgo * msPerDay)
        : null;

    const task = await prisma.task.create({
      data: {
        title: s.title,
        description: `Seeded for employee2 dashboard ${PROJECT_CODE}`,
        projectId: project.id,
        assignedToId: employee.id,
        createdById: employee.id,
        status: s.status,
        priority: TaskPriority.MEDIUM,
        code: `EMP2-T-${String(i + 1).padStart(2, "0")}`,
        dueDate,
        startDate: createdAt,
        completedAt,
        createdAt,
        progressPercentage:
          s.status === TaskStatus.COMPLETED
            ? 100
            : s.status === TaskStatus.IN_PROGRESS
              ? 45
              : 10,
      },
    });

    taskIds.push(task.id);
  }

  const anchor = atNoon(new Date());
  const sickStart = mondayOnOrBefore(addCalendarDays(anchor, -56));
  const sickEnd = addCalendarDays(sickStart, 2);
  const casualDay = addCalendarDays(mondayOnOrBefore(addCalendarDays(anchor, -38)), 3);
  const earnedStart = mondayOnOrBefore(addCalendarDays(anchor, -26));
  const earnedEnd = addCalendarDays(earnedStart, 1);
  const rejectedStart = addCalendarDays(mondayOnOrBefore(addCalendarDays(anchor, -32)), 1);
  const rejectedEnd = addCalendarDays(rejectedStart, 1);
  const pendingFutureStart = mondayOnOrBefore(addCalendarDays(anchor, 12));
  const pendingFutureEnd = addCalendarDays(pendingFutureStart, 2);
  const pendingSoonStart = addCalendarDays(mondayOnOrBefore(anchor), 2);
  const pendingSoonEnd = pendingSoonStart;

  await prisma.leave.deleteMany({
    where: {
      employeeId: employee.id,
      reason: { startsWith: SEED_LEAVE_PREFIX },
    },
  });

  const approverId = approverEmployee?.id ?? null;

  await prisma.leave.create({
    data: {
      employeeId: employee.id,
      departmentId: itDept.id,
      type: LeaveType.SICK,
      status: LeaveStatus.APPROVED,
      reason: `${SEED_LEAVE_PREFIX} Flu recovery`,
      startDate: sickStart,
      endDate: sickEnd,
      approvedById: approverId,
    },
  });

  await prisma.leave.create({
    data: {
      employeeId: employee.id,
      departmentId: itDept.id,
      type: LeaveType.CASUAL,
      status: LeaveStatus.APPROVED,
      reason: `${SEED_LEAVE_PREFIX} Personal errands`,
      startDate: casualDay,
      endDate: casualDay,
      approvedById: approverId,
    },
  });

  await prisma.leave.create({
    data: {
      employeeId: employee.id,
      departmentId: itDept.id,
      type: LeaveType.EARNED,
      status: LeaveStatus.APPROVED,
      reason: `${SEED_LEAVE_PREFIX} Long weekend`,
      startDate: earnedStart,
      endDate: earnedEnd,
      approvedById: approverId,
    },
  });

  await prisma.leave.create({
    data: {
      employeeId: employee.id,
      departmentId: itDept.id,
      type: LeaveType.UNPAID,
      status: LeaveStatus.REJECTED,
      reason: `${SEED_LEAVE_PREFIX} Extended travel (rejected)`,
      startDate: rejectedStart,
      endDate: rejectedEnd,
    },
  });

  await prisma.leave.create({
    data: {
      employeeId: employee.id,
      departmentId: itDept.id,
      type: LeaveType.EARNED,
      status: LeaveStatus.PENDING,
      reason: `${SEED_LEAVE_PREFIX} Summer block leave`,
      startDate: pendingFutureStart,
      endDate: pendingFutureEnd,
    },
  });

  await prisma.leave.create({
    data: {
      employeeId: employee.id,
      departmentId: itDept.id,
      type: LeaveType.CASUAL,
      status: LeaveStatus.PENDING,
      reason: `${SEED_LEAVE_PREFIX} Half-day personal`,
      startDate: pendingSoonStart,
      endDate: pendingSoonEnd,
    },
  });

  const approvedLeaveDayKeys = new Set<string>([
    ...collectLeaveCalendarKeys(sickStart, sickEnd),
    ...collectLeaveCalendarKeys(casualDay, casualDay),
    ...collectLeaveCalendarKeys(earnedStart, earnedEnd),
  ]);

  const rangeLow = startOfLocalDay(addCalendarDays(anchor, -85));
  const rangeHigh = startOfLocalDay(addCalendarDays(anchor, 2));
  const attIds = (
    await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: rangeLow, lt: rangeHigh },
      },
      select: { id: true },
    })
  ).map((a) => a.id);

  if (attIds.length > 0) {
    const regIds = (
      await prisma.regularizationRequest.findMany({
        where: { attendanceId: { in: attIds } },
        select: { id: true },
      })
    ).map((r) => r.id);
    if (regIds.length) {
      await prisma.regularizationAuditEntry.deleteMany({
        where: { requestId: { in: regIds } },
      });
      await prisma.regularizationRequest.deleteMany({ where: { id: { in: regIds } } });
    }
    await prisma.attendanceAuditEntry.deleteMany({
      where: { attendanceId: { in: attIds } },
    });
    await prisma.attendance.deleteMany({ where: { id: { in: attIds } } });
  }

  // Past days only — leave "today" empty so real check-in/check-out can create `timeSlots`.
  for (let i = -70; i < 0; i++) {
    const calendarDay = addCalendarDays(anchor, i);
    if (calendarDay.getDay() === 0 || calendarDay.getDay() === 6) continue;

    const dayStamp = startOfLocalDay(calendarDay);
    const key = ymd(dayStamp);

    if (approvedLeaveDayKeys.has(key)) {
      await prisma.attendance.upsert({
        where: { employeeId_date: { employeeId: employee.id, date: dayStamp } },
        update: {
          companyId: company.id,
          departmentId: itDept.id,
          status: AttendanceStatus.LEAVE,
          workHours: 0,
          checkIn: null,
          checkOut: null,
        },
        create: {
          employeeId: employee.id,
          companyId: company.id,
          departmentId: itDept.id,
          date: dayStamp,
          status: AttendanceStatus.LEAVE,
          workHours: 0,
          checkIn: null,
          checkOut: null,
        },
      });
    } else {
      const k = employee.id + i;
      const workHours = 7.5 + (k % 25) / 10;
      await prisma.attendance.upsert({
        where: { employeeId_date: { employeeId: employee.id, date: dayStamp } },
        update: {
          companyId: company.id,
          departmentId: itDept.id,
          status: AttendanceStatus.PRESENT,
          workHours,
          checkIn: new Date(dayStamp.getTime() + 3600000 * 9),
          checkOut: new Date(
            dayStamp.getTime() + 3600000 * 9 + workHours * 3600000
          ),
        },
        create: {
          employeeId: employee.id,
          companyId: company.id,
          departmentId: itDept.id,
          date: dayStamp,
          status: AttendanceStatus.PRESENT,
          workHours,
          checkIn: new Date(dayStamp.getTime() + 3600000 * 9),
          checkOut: new Date(
            dayStamp.getTime() + 3600000 * 9 + workHours * 3600000
          ),
        },
      });
    }
  }

  const mon = mondayStartLocal();
  const minutesPerDay = [8 * 60, 8 * 60, 7.5 * 60, 7.5 * 60, 7 * 60];

  for (let d = 0; d < 5; d++) {
    const mins = Math.round(minutesPerDay[d]!);
    const dayBase = dayAtNoon(mon, d);
    const startTime = new Date(dayBase.getTime() - 4 * 3600000);
    const endTime = new Date(startTime.getTime() + mins * 60000);

    await prisma.taskTimeEntry.create({
      data: {
        taskId: taskIds[d % taskIds.length]!,
        employeeId: employee.id,
        startTime,
        endTime,
        duration: mins,
        description: `SEED_EMP2_TIME day-${d}`,
      },
    });
  }

  console.log(
    `✅ Employee2 dashboard seed: ${USER_EMAIL} / ${EMPLOYEE_CODE} — ${specs.length} tasks on ${PROJECT_CODE}, 2 tasks on ${SECOND_PROJECT_CODE}, 6 leave rows, ~70d weekday attendance, week time entries (password same as seed).`
  );
}