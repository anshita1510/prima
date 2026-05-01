/**
 * Rich demo data for PRIMA company: team, projects, tasks, attendance, leaves,
 * notifications, calendar/meetings, timesheets (task time entries), project reports,
 * and pending regularizations (approvals).
 *
 * Idempotent: removes previous demo projects (codes PRJ-DEMO-*) and recreates them.
 */
import type { PrismaClient } from "@prisma/client";
import {
  Role,
  DepartmentType,
  Designation,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  AttendanceStatus,
  LeaveType,
  LeaveStatus,
  NotificationType,
  RequestStatus,
  RegularizationType,
  PolicyStatus,
} from "@prisma/client";

const DEMO_PREFIX = "PRJ-DEMO";

function utc(
  y: number,
  m: number,
  d: number,
  h = 12,
  min = 0,
  sec = 0
) {
  return new Date(Date.UTC(y, m - 1, d, h, min, sec));
}

export async function seedRichDemo(prisma: PrismaClient, passwordHash: string): Promise<void> {
  console.log("📦 Seeding rich demo data…");

  const company = await prisma.company.findUnique({ where: { code: "PRIMA" } });
  if (!company) {
    console.warn("⚠️ Company PRIMA not found — skip rich demo.");
    return;
  }

  const itDept =
    (await prisma.department.findFirst({
      where: { companyId: company.id, name: "IT" },
    })) ||
    (await prisma.department.create({
      data: {
        name: "IT",
        type: DepartmentType.IT,
        companyId: company.id,
      },
    }));

  const productDept = await prisma.department.upsert({
    where: { companyId_name: { companyId: company.id, name: "Product" } },
    update: {},
    create: {
      name: "Product",
      type: DepartmentType.MARKETING,
      companyId: company.id,
    },
  });

  const adminUser = await prisma.user.findUnique({ where: { email: "admin@mailinator.com" } });
  if (!adminUser) {
    console.warn("⚠️ admin@mailinator.com not found — skip rich demo.");
    return;
  }

  const adminEmpOther = await prisma.employee.findUnique({ where: { userId: adminUser.id } });
  if (adminEmpOther && adminEmpOther.employeeCode !== "EMP-0002") {
    await prisma.employee.delete({ where: { id: adminEmpOther.id } });
  }
  const adminEmployee = await prisma.employee.upsert({
    where: { employeeCode: "EMP-0002" },
    update: {
      userId: adminUser.id,
      name: "admin user",
      departmentId: itDept.id,
      companyId: company.id,
      designation: Designation.MANAGER,
      isActive: true,
    },
    create: {
      userId: adminUser.id,
      companyId: company.id,
      departmentId: itDept.id,
      name: "admin user",
      designation: Designation.MANAGER,
      employeeCode: "EMP-0002",
      isActive: true,
    },
  });

  await prisma.user.update({
    where: { id: adminUser.id },
    data: {
      firstName: "admin",
      lastName: "user",
      designation: "ADMIN",
      role: Role.ADMIN,
      status: "ACTIVE",
      isActive: true,
      companyId: company.id,
    },
  });

  await prisma.department.update({
    where: { id: itDept.id },
    data: { managerId: adminEmployee.id },
  });

  type TeamSeed = {
    email: string;
    firstName: string;
    lastName: string;
    empCode: string;
    designation: Designation;
    userDesignation: string;
    role?: Role;
  };

  const teamSeeds: TeamSeed[] = [
    {
      email: "employee.meenu@mailinator.com",
      firstName: "Meenu",
      lastName: "Rani",
      empCode: "EMP-MR01",
      designation: Designation.SOFTWARE_ENGINEER,
      userDesignation: "UI/UX Designer",
    },
    {
      email: "employee.raman@mailinator.com",
      firstName: "Raman",
      lastName: "Kumar",
      empCode: "EMP-RK01",
      designation: Designation.SOFTWARE_ENGINEER,
      userDesignation: "QA Engineer",
    },
    {
      email: "employee.mishri@mailinator.com",
      firstName: "Mishri",
      lastName: "Rani",
      empCode: "EMP-MI01",
      designation: Designation.SOFTWARE_ENGINEER,
      userDesignation: "Developer",
    },
    {
      email: "employee.raju@mailinator.com",
      firstName: "Raju",
      lastName: "Kumar",
      empCode: "EMP-RJ01",
      designation: Designation.SENIOR_ENGINEER,
      userDesignation: "UI/UX Designer",
    },
    {
      email: "manager.rakshi@mailinator.com",
      firstName: "Rakshi",
      lastName: "Kumari",
      empCode: "EMP-RS01",
      designation: Designation.MANAGER,
      userDesignation: "Product Manager",
      role: Role.MANAGER,
    },
    {
      email: "employee.varun@mailinator.com",
      firstName: "Varun",
      lastName: "Sharma",
      empCode: "EMP-VS01",
      designation: Designation.SOFTWARE_ENGINEER,
      userDesignation: "QA Engineer",
    },
    {
      email: "employee.pooja@mailinator.com",
      firstName: "Pooja",
      lastName: "Singh",
      empCode: "EMP-PS01",
      designation: Designation.SOFTWARE_ENGINEER,
      userDesignation: "Backend Developer",
    },
    {
      email: "employee.amit@mailinator.com",
      firstName: "Amit",
      lastName: "Verma",
      empCode: "EMP-AV01",
      designation: Designation.SOFTWARE_ENGINEER,
      userDesignation: "DevOps Engineer",
    },
    {
      email: "hr.sonia@mailinator.com",
      firstName: "Sonia",
      lastName: "Verma",
      empCode: "EMP-HR01",
      designation: Designation.HR,
      userDesignation: "HR Business Partner",
    },
  ];

  const legacyTeamEmailMigrations: [string, string][] = [
    ["meenu.rani@mailinator.com", "employee.meenu@mailinator.com"],
    ["raman.kumar@mailinator.com", "employee.raman@mailinator.com"],
    ["mishri.rani@mailinator.com", "employee.mishri@mailinator.com"],
    ["raju.kumar@mailinator.com", "employee.raju@mailinator.com"],
    ["rakshi.kumari@mailinator.com", "manager.rakshi@mailinator.com"],
    ["varun.sharma@mailinator.com", "employee.varun@mailinator.com"],
    ["pooja.singh@mailinator.com", "employee.pooja@mailinator.com"],
    ["amit.verma@mailinator.com", "employee.amit@mailinator.com"],
  ];
  for (const [fromEmail, toEmail] of legacyTeamEmailMigrations) {
    const prev = await prisma.user.findUnique({ where: { email: fromEmail } });
    const taken = await prisma.user.findUnique({ where: { email: toEmail } });
    if (prev && prev.companyId === company.id && !taken) {
      await prisma.user.update({ where: { id: prev.id }, data: { email: toEmail } });
    }
  }

  const teamEmployees: { id: number; name: string; email: string }[] = [];

  for (const t of teamSeeds) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {
        firstName: t.firstName,
        lastName: t.lastName,
        designation: t.userDesignation,
        phone: "+919000000001",
        role: t.role ?? Role.EMPLOYEE,
        status: "ACTIVE",
        isActive: true,
        companyId: company.id,
        password: passwordHash,
      },
      create: {
        email: t.email,
        firstName: t.firstName,
        lastName: t.lastName,
        designation: t.userDesignation,
        phone: "+919000000001",
        password: passwordHash,
        role: t.role ?? Role.EMPLOYEE,
        status: "ACTIVE",
        isActive: true,
        companyId: company.id,
      },
    });

    const teamEmpOther = await prisma.employee.findUnique({ where: { userId: user.id } });
    if (teamEmpOther && teamEmpOther.employeeCode !== t.empCode) {
      await prisma.employee.delete({ where: { id: teamEmpOther.id } });
    }
    const emp = await prisma.employee.upsert({
      where: { employeeCode: t.empCode },
      update: {
        userId: user.id,
        name: `${t.firstName} ${t.lastName}`,
        designation: t.designation,
        companyId: company.id,
        departmentId: itDept.id,
        isActive: true,
        managerId: adminEmployee.id,
      },
      create: {
        userId: user.id,
        companyId: company.id,
        departmentId: itDept.id,
        name: `${t.firstName} ${t.lastName}`,
        designation: t.designation,
        employeeCode: t.empCode,
        isActive: true,
        managerId: adminEmployee.id,
      },
    });
    teamEmployees.push({ id: emp.id, name: emp.name, email: t.email });
  }

  const byEmail = (email: string) => teamEmployees.find((e) => e.email === email)!;

  await prisma.projectReport.deleteMany({
    where: { project: { companyId: company.id, code: { startsWith: DEMO_PREFIX } } },
  });

  await prisma.project.deleteMany({
    where: { companyId: company.id, code: { startsWith: DEMO_PREFIX } },
  });

  const pWeb = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Marketing site refresh and component library",
      companyId: company.id,
      departmentId: productDept.id,
      ownerId: adminEmployee.id,
      code: `${DEMO_PREFIX}-WEB`,
      status: ProjectStatus.ACTIVE,
      startDate: utc(2026, 3, 1),
      endDate: utc(2026, 6, 30),
      progressPercentage: 45,
      members: { connect: [{ id: adminEmployee.id }, ...teamEmployees.map((e) => ({ id: e.id }))] },
    },
  });

  const pEcom = await prisma.project.create({
    data: {
      name: "E-commerce Platform",
      description: "Checkout and catalog experience",
      companyId: company.id,
      departmentId: itDept.id,
      ownerId: byEmail("raman.kumar@mailinator.com").id,
      code: `${DEMO_PREFIX}-ECOM`,
      status: ProjectStatus.ACTIVE,
      startDate: utc(2026, 2, 15),
      endDate: utc(2026, 8, 1),
      progressPercentage: 30,
      members: { connect: [{ id: adminEmployee.id }, ...teamEmployees.map((e) => ({ id: e.id }))] },
    },
  });

  const pMobile = await prisma.project.create({
    data: {
      name: "Mobile App Development",
      description: "iOS and Android releases",
      companyId: company.id,
      departmentId: itDept.id,
      ownerId: adminEmployee.id,
      code: `${DEMO_PREFIX}-MOB`,
      status: ProjectStatus.ACTIVE,
      startDate: utc(2026, 1, 10),
      endDate: utc(2026, 7, 15),
      progressPercentage: 55,
      members: { connect: [{ id: adminEmployee.id }, ...teamEmployees.map((e) => ({ id: e.id }))] },
    },
  });

  const pAdmin = await prisma.project.create({
    data: {
      name: "Admin Panel",
      description: "Internal admin and RBAC",
      companyId: company.id,
      departmentId: itDept.id,
      ownerId: byEmail("raju.kumar@mailinator.com").id,
      code: `${DEMO_PREFIX}-ADM`,
      status: ProjectStatus.ACTIVE,
      startDate: utc(2026, 3, 20),
      endDate: utc(2026, 9, 1),
      progressPercentage: 40,
      members: { connect: [{ id: adminEmployee.id }, ...teamEmployees.map((e) => ({ id: e.id }))] },
    },
  });

  for (const pid of [pWeb.id, pEcom.id, pMobile.id, pAdmin.id]) {
    for (const eid of [...teamEmployees.map((e) => e.id), adminEmployee.id]) {
      await prisma.projectMember.upsert({
        where: { projectId_employeeId: { projectId: pid, employeeId: eid } },
        update: { isActive: true },
        create: { projectId: pid, employeeId: eid, role: "MEMBER", isActive: true },
      });
    }
  }

  type TDef = {
    title: string;
    description: string;
    projectId: number;
    assignEmail: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    due: Date;
    code: string;
  };

  const taskDefs: TDef[] = [
    {
      title: "Design homepage UI",
      description: "Create responsive homepage design in Figma",
      projectId: pWeb.id,
      assignEmail: "employee.meenu@mailinator.com",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      due: utc(2026, 5, 5),
      code: "DEMO-T001",
    },
    {
      title: "API integration",
      description: "Integrate payment gateway APIs",
      projectId: pEcom.id,
      assignEmail: "employee.raman@mailinator.com",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      due: utc(2026, 5, 8),
      code: "DEMO-T002",
    },
    {
      title: "Fix login issue",
      description: "Resolve login bug on mobile devices",
      projectId: pMobile.id,
      assignEmail: "employee.mishri@mailinator.com",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      due: utc(2026, 4, 18),
      code: "DEMO-T003",
    },
    {
      title: "Database optimization",
      description: "Optimize database queries",
      projectId: pAdmin.id,
      assignEmail: "employee.raju@mailinator.com",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      due: utc(2026, 5, 10),
      code: "DEMO-T004",
    },
    {
      title: "User role management",
      description: "Implement user roles and permissions",
      projectId: pAdmin.id,
      assignEmail: "manager.rakshi@mailinator.com",
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      due: utc(2026, 5, 12),
      code: "DEMO-T005",
    },
    {
      title: "Write unit tests",
      description: "Add unit tests for auth module",
      projectId: pMobile.id,
      assignEmail: "employee.varun@mailinator.com",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      due: utc(2026, 4, 19),
      code: "DEMO-T006",
    },
  ];

  const extraTitles: { title: string; projectId: number; status: TaskStatus; priority: TaskPriority; day: number }[] = [
      { title: "Sprint planning deck", projectId: pWeb.id, status: TaskStatus.COMPLETED, priority: TaskPriority.LOW, day: 10 },
      { title: "Accessibility audit", projectId: pWeb.id, status: TaskStatus.IN_REVIEW, priority: TaskPriority.HIGH, day: 28 },
      { title: "Cart abandonment flow", projectId: pEcom.id, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, day: 26 },
      { title: "Inventory sync job", projectId: pEcom.id, status: TaskStatus.TODO, priority: TaskPriority.HIGH, day: 29 },
      { title: "Push notification setup", projectId: pMobile.id, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.URGENT, day: 27 },
      { title: "Crashlytics wiring", projectId: pMobile.id, status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, day: 8 },
      { title: "Audit log export", projectId: pAdmin.id, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, day: 5 },
      { title: "Dark mode tokens", projectId: pWeb.id, status: TaskStatus.TODO, priority: TaskPriority.LOW, day: 30 },
      { title: "Webhook retries", projectId: pEcom.id, status: TaskStatus.IN_REVIEW, priority: TaskPriority.MEDIUM, day: 25 },
      { title: "Biometric login", projectId: pMobile.id, status: TaskStatus.TODO, priority: TaskPriority.HIGH, day: 22 },
      { title: "Rate limiter tuning", projectId: pAdmin.id, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, day: 24 },
      { title: "Email templates v2", projectId: pEcom.id, status: TaskStatus.COMPLETED, priority: TaskPriority.LOW, day: 4 },
      { title: "Load test harness", projectId: pEcom.id, status: TaskStatus.CANCELLED, priority: TaskPriority.LOW, day: 3 },
      { title: "Legacy API sunset", projectId: pAdmin.id, status: TaskStatus.CANCELLED, priority: TaskPriority.MEDIUM, day: 2 },
      { title: "Storybook docs", projectId: pWeb.id, status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, day: 6 },
      { title: "SEO meta review", projectId: pWeb.id, status: TaskStatus.TODO, priority: TaskPriority.LOW, day: 31 },
      { title: "Refund workflow", projectId: pEcom.id, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, day: 7 },
      { title: "Deep link QA", projectId: pMobile.id, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, day: 29 },
  ];

  extraTitles.forEach((x, idx) => {
    taskDefs.push({
      title: x.title,
      description: "Demo task for reporting and dashboards.",
      projectId: x.projectId,
      assignEmail: teamEmployees[idx % teamEmployees.length].email,
      status: x.status,
      priority: x.priority,
      due: utc(2026, 4, Math.min(30, Math.max(1, x.day))),
      code: `DEMO-T${String(7 + idx).padStart(3, "0")}`,
    });
  });

  for (const td of taskDefs) {
    const assignId = td.assignEmail ? byEmail(td.assignEmail).id : null;
    await prisma.task.create({
      data: {
        title: td.title,
        description: td.description,
        projectId: td.projectId,
        assignedToId: assignId,
        createdById: adminEmployee.id,
        status: td.status,
        priority: td.priority,
        dueDate: td.due,
        code: td.code,
        progressPercentage: td.status === TaskStatus.COMPLETED ? 100 : td.status === TaskStatus.IN_PROGRESS ? 45 : 10,
        completedAt: td.status === TaskStatus.COMPLETED ? utc(2026, 4, Math.min(20, td.due.getUTCDate())) : null,
      },
    });
  }

  const allDemoTasks = await prisma.task.findMany({
    where: { projectId: { in: [pWeb.id, pEcom.id, pMobile.id, pAdmin.id] } },
    select: { id: true },
  });

  for (const t of allDemoTasks.slice(0, 12)) {
    await prisma.taskTimeEntry.create({
      data: {
        taskId: t.id,
        employeeId: adminEmployee.id,
        description: "Focused work session",
        startTime: utc(2026, 4, 20, 9),
        endTime: utc(2026, 4, 20, 13),
        duration: 240,
      },
    });
  }

  const today = utc(2026, 4, 30);
  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    for (const emp of teamEmployees.slice(0, 5)) {
      await prisma.attendance.upsert({
        where: { employeeId_date: { employeeId: emp.id, date: d } },
        update: {
          status: i % 7 === 0 ? AttendanceStatus.LEAVE : AttendanceStatus.PRESENT,
          checkIn: utc(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 9),
          checkOut: utc(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 18),
          workHours: 8,
        },
        create: {
          employeeId: emp.id,
          companyId: company.id,
          departmentId: itDept.id,
          date: d,
          status: i % 7 === 0 ? AttendanceStatus.LEAVE : AttendanceStatus.PRESENT,
          checkIn: utc(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 9),
          checkOut: utc(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 18),
          workHours: 8,
        },
      });
    }
  }

  await prisma.leave.deleteMany({
    where: {
      OR: [
        { reason: { startsWith: "SEED_RICH:" } },
        { reason: { startsWith: "[SEED_UI_LEAVE]" } },
      ],
    },
  });

  const emp = (idx: number) => teamEmployees[idx]!.id;

  /** Wider than `LeaveType` / `LeaveStatus` when the editor uses a pre–`prisma generate` client. */
  type SeedLeaveType = LeaveType | "ANNUAL" | "WORK_FROM_HOME";
  type SeedLeaveStatus = LeaveStatus | "CANCELLED";

  type SeedLeaveRow = {
    empIdx: number;
    type: SeedLeaveType;
    status: SeedLeaveStatus;
    reason: string;
    start: Date;
    end: Date;
    createdAt: Date;
    approvedById?: number | null;
  };

  const seedLeaveRows: SeedLeaveRow[] = [
    // 8 pending — matches leave approvals UI reference
    {
      empIdx: 0,
      type: LeaveType.CASUAL,
      status: LeaveStatus.PENDING,
      reason: "[SEED_UI_LEAVE] Personal work at home",
      start: utc(2026, 5, 28),
      end: utc(2026, 5, 30),
      createdAt: utc(2026, 5, 25, 10, 30),
    },
    {
      empIdx: 1,
      type: LeaveType.SICK,
      status: LeaveStatus.PENDING,
      reason: "[SEED_UI_LEAVE] Fever and body ache",
      start: utc(2026, 5, 29),
      end: utc(2026, 5, 29),
      createdAt: utc(2026, 5, 25, 9, 15),
    },
    {
      empIdx: 2,
      type: LeaveType.CASUAL,
      status: LeaveStatus.PENDING,
      reason: "[SEED_UI_LEAVE] Family function",
      start: utc(2026, 6, 2),
      end: utc(2026, 6, 4),
      createdAt: utc(2026, 5, 24, 16, 20),
    },
    {
      empIdx: 3,
      type: "ANNUAL",
      status: LeaveStatus.PENDING,
      reason: "[SEED_UI_LEAVE] Vacation trip",
      start: utc(2026, 6, 5),
      end: utc(2026, 6, 11),
      createdAt: utc(2026, 5, 24, 11, 45),
    },
    {
      empIdx: 4,
      type: LeaveType.SICK,
      status: LeaveStatus.PENDING,
      reason: "[SEED_UI_LEAVE] Migraine",
      start: utc(2026, 5, 27),
      end: utc(2026, 5, 28),
      createdAt: utc(2026, 5, 23, 14, 10),
    },
    {
      empIdx: 5,
      type: LeaveType.CASUAL,
      status: LeaveStatus.PENDING,
      reason: "[SEED_UI_LEAVE] Personal work",
      start: utc(2026, 5, 26),
      end: utc(2026, 5, 26),
      createdAt: utc(2026, 5, 23, 10, 5),
    },
    {
      empIdx: 6,
      type: "WORK_FROM_HOME",
      status: LeaveStatus.PENDING,
      reason: "[SEED_UI_LEAVE] Home renovation",
      start: utc(2026, 5, 26),
      end: utc(2026, 5, 26),
      createdAt: utc(2026, 5, 22, 9, 30),
    },
    {
      empIdx: 7,
      type: LeaveType.CASUAL,
      status: LeaveStatus.PENDING,
      reason: "[SEED_UI_LEAVE] Personal work",
      start: utc(2026, 5, 27),
      end: utc(2026, 5, 27),
      createdAt: utc(2026, 5, 22, 9, 0),
    },
    // 12 approved (mix for sidebar counts: casual 10, sick 5, annual 4, WFH 3, other 2)
    {
      empIdx: 0,
      type: LeaveType.CASUAL,
      status: LeaveStatus.APPROVED,
      reason: "[SEED_UI_LEAVE] Approved casual leave",
      start: utc(2026, 6, 10),
      end: utc(2026, 6, 11),
      createdAt: utc(2026, 4, 1, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 3,
      type: LeaveType.CASUAL,
      status: LeaveStatus.APPROVED,
      reason: "[SEED_UI_LEAVE] Approved casual leave",
      start: utc(2026, 6, 18),
      end: utc(2026, 6, 19),
      createdAt: utc(2026, 4, 2, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 2,
      type: LeaveType.CASUAL,
      status: LeaveStatus.APPROVED,
      reason: "[SEED_UI_LEAVE] Approved casual leave",
      start: utc(2026, 6, 15),
      end: utc(2026, 6, 16),
      createdAt: utc(2026, 4, 3, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 5,
      type: LeaveType.CASUAL,
      status: LeaveStatus.APPROVED,
      reason: "[SEED_UI_LEAVE] Approved casual leave",
      start: utc(2026, 6, 8),
      end: utc(2026, 6, 8),
      createdAt: utc(2026, 4, 4, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 4,
      type: LeaveType.SICK,
      status: LeaveStatus.APPROVED,
      reason: "[SEED_UI_LEAVE] Medical leave approved",
      start: utc(2026, 6, 3),
      end: utc(2026, 6, 4),
      createdAt: utc(2026, 4, 5, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 0,
      type: LeaveType.SICK,
      status: LeaveStatus.APPROVED,
      reason: "[SEED_UI_LEAVE] Short sick leave",
      start: utc(2026, 6, 1),
      end: utc(2026, 6, 1),
      createdAt: utc(2026, 4, 6, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 4,
      type: "ANNUAL",
      status: LeaveStatus.APPROVED,
      reason: "[SEED_UI_LEAVE] Planned annual leave",
      start: utc(2026, 7, 2),
      end: utc(2026, 7, 4),
      createdAt: utc(2026, 4, 7, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 5,
      type: "ANNUAL",
      status: LeaveStatus.APPROVED,
      reason: "[SEED_UI_LEAVE] Planned annual leave",
      start: utc(2026, 7, 10),
      end: utc(2026, 7, 12),
      createdAt: utc(2026, 4, 8, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 6,
      type: "WORK_FROM_HOME",
      status: LeaveStatus.APPROVED,
      reason: "[SEED_UI_LEAVE] WFH approved",
      start: utc(2026, 6, 12),
      end: utc(2026, 6, 12),
      createdAt: utc(2026, 4, 9, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 7,
      type: "WORK_FROM_HOME",
      status: LeaveStatus.APPROVED,
      reason: "[SEED_UI_LEAVE] WFH approved",
      start: utc(2026, 6, 13),
      end: utc(2026, 6, 13),
      createdAt: utc(2026, 4, 10, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 2,
      type: LeaveType.EARNED,
      status: LeaveStatus.APPROVED,
      reason: "[SEED_UI_LEAVE] Earned leave",
      start: utc(2026, 6, 25),
      end: utc(2026, 6, 26),
      createdAt: utc(2026, 4, 11, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 6,
      type: LeaveType.UNPAID,
      status: LeaveStatus.APPROVED,
      reason: "[SEED_UI_LEAVE] Unpaid leave",
      start: utc(2026, 6, 28),
      end: utc(2026, 6, 28),
      createdAt: utc(2026, 4, 12, 9, 0),
      approvedById: adminEmployee.id,
    },
    // 3 rejected
    {
      empIdx: 7,
      type: LeaveType.CASUAL,
      status: LeaveStatus.REJECTED,
      reason: "[SEED_UI_LEAVE] Rejected — peak workload",
      start: utc(2026, 3, 1),
      end: utc(2026, 3, 1),
      createdAt: utc(2026, 2, 20, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 6,
      type: LeaveType.SICK,
      status: LeaveStatus.REJECTED,
      reason: "[SEED_UI_LEAVE] Rejected — incomplete docs",
      start: utc(2026, 3, 5),
      end: utc(2026, 3, 6),
      createdAt: utc(2026, 2, 21, 9, 0),
      approvedById: adminEmployee.id,
    },
    {
      empIdx: 1,
      type: "ANNUAL",
      status: LeaveStatus.REJECTED,
      reason: "[SEED_UI_LEAVE] Rejected — blackout dates",
      start: utc(2026, 3, 10),
      end: utc(2026, 3, 12),
      createdAt: utc(2026, 2, 22, 9, 0),
      approvedById: adminEmployee.id,
    },
    // 1 cancelled
    {
      empIdx: 4,
      type: LeaveType.CASUAL,
      status: "CANCELLED",
      reason: "[SEED_UI_LEAVE] Withdrawn by employee",
      start: utc(2026, 2, 1),
      end: utc(2026, 2, 1),
      createdAt: utc(2026, 1, 28, 9, 0),
      approvedById: null,
    },
  ];

  const pendingLeaveIdsForNotifs: number[] = [];
  for (const row of seedLeaveRows) {
    const created = await prisma.leave.create({
      data: {
        employeeId: emp(row.empIdx),
        departmentId: itDept.id,
        type: row.type as LeaveType,
        status: row.status as LeaveStatus,
        reason: row.reason,
        startDate: row.start,
        endDate: row.end,
        ...(row.approvedById != null ? { approvedById: row.approvedById } : {}),
        createdAt: row.createdAt,
      },
    });
    if (row.status === LeaveStatus.PENDING && pendingLeaveIdsForNotifs.length < 3) {
      pendingLeaveIdsForNotifs.push(created.id);
    }
  }

  await prisma.notificationRecipient.deleteMany({
    where: { notification: { title: "Sprint review tomorrow", createdById: adminEmployee.id } },
  });
  await prisma.notification.deleteMany({
    where: { title: "Sprint review tomorrow", createdById: adminEmployee.id },
  });

  const notif = await prisma.notification.create({
    data: {
      title: "Sprint review tomorrow",
      message: "Please update task statuses before 10:00.",
      type: NotificationType.DEADLINE_REMINDER,
      createdById: adminEmployee.id,
      referenceType: "PROJECT",
      referenceId: pWeb.id,
    },
  });

  for (const e of [...teamEmployees, { id: adminEmployee.id, name: "admin", email: "" }]) {
    await prisma.notificationRecipient.upsert({
      where: {
        notificationId_recipientId: { notificationId: notif.id, recipientId: e.id },
      },
      update: {},
      create: { notificationId: notif.id, recipientId: e.id, isRead: false },
    });
  }

  await prisma.calendarEventAttendee.deleteMany({
    where: {
      OR: [
        { event: { title: { startsWith: "SEED_RICH:" } } },
        { event: { title: { startsWith: "[SEED_UI_MEET]" } } },
      ],
    },
  });
  await prisma.calendarEvent.deleteMany({
    where: {
      OR: [{ title: { startsWith: "SEED_RICH:" } }, { title: { startsWith: "[SEED_UI_MEET]" } }],
    },
  });

  const meetDesc = (meta: Record<string, string | number>) =>
    JSON.stringify({ seedTag: "[SEED_UI_MEET]", ...meta });

  const attachAttendees = async (eventId: number, count: number) => {
    const ids = teamEmployees.slice(0, Math.min(count, teamEmployees.length)).map((e) => e.id);
    for (const attendeeId of ids) {
      await prisma.calendarEventAttendee.upsert({
        where: { eventId_attendeeId: { eventId, attendeeId } },
        update: {},
        create: { eventId, attendeeId, status: "accepted" },
      });
    }
  };

  const meetRows: {
    title: string;
    meta: Record<string, string | number>;
    start: Date;
    end: Date;
    organizerId: number;
    attendees: number;
  }[] = [
    {
      title: "[SEED_UI_MEET] Project Kickoff Meeting",
      meta: { status: "UPCOMING", kind: "TEAM", project: "Website Redesign", participants: 6 },
      start: utc(2026, 4, 28, 11),
      end: utc(2026, 4, 28, 12),
      organizerId: adminEmployee.id,
      attendees: 6,
    },
    {
      title: "[SEED_UI_MEET] One-on-One with Raman",
      meta: { status: "UPCOMING", kind: "ONE_ON_ONE", role: "QA Engineer", participants: 2 },
      start: utc(2026, 4, 29, 14),
      end: utc(2026, 4, 29, 14, 30),
      organizerId: adminEmployee.id,
      attendees: 2,
    },
    {
      title: "[SEED_UI_MEET] Sprint Planning",
      meta: { status: "UPCOMING", kind: "TEAM", project: "Mobile App Development", participants: 7 },
      start: utc(2026, 4, 30, 10, 30),
      end: utc(2026, 4, 30, 11, 30),
      organizerId: adminEmployee.id,
      attendees: 7,
    },
    {
      title: "[SEED_UI_MEET] Client Review Meeting",
      meta: { status: "UPCOMING", kind: "CLIENT", project: "E-commerce Platform", participants: 4 },
      start: utc(2026, 5, 2, 16),
      end: utc(2026, 5, 2, 17),
      organizerId: adminEmployee.id,
      attendees: 4,
    },
    {
      title: "[SEED_UI_MEET] Architecture review",
      meta: { status: "UPCOMING", kind: "TEAM", project: "Admin Panel", participants: 5 },
      start: utc(2026, 5, 6, 10),
      end: utc(2026, 5, 6, 11),
      organizerId: adminEmployee.id,
      attendees: 5,
    },
    {
      title: "[SEED_UI_MEET] One-on-One with Meenu",
      meta: { status: "COMPLETED", kind: "ONE_ON_ONE", role: "UI/UX Designer", participants: 2 },
      start: utc(2026, 5, 5, 15),
      end: utc(2026, 5, 5, 15, 30),
      organizerId: adminEmployee.id,
      attendees: 2,
    },
    {
      title: "[SEED_UI_MEET] Retrospective Meeting",
      meta: { status: "COMPLETED", kind: "TEAM", project: "Admin Panel", participants: 5 },
      start: utc(2026, 4, 25, 11),
      end: utc(2026, 4, 25, 12),
      organizerId: adminEmployee.id,
      attendees: 5,
    },
    {
      title: "[SEED_UI_MEET] Daily Standup",
      meta: { status: "COMPLETED", kind: "TEAM", project: "Website Redesign", participants: 6 },
      start: utc(2026, 4, 25, 9),
      end: utc(2026, 4, 25, 9, 30),
      organizerId: adminEmployee.id,
      attendees: 6,
    },
    {
      title: "[SEED_UI_MEET] Stakeholder demo",
      meta: { status: "COMPLETED", kind: "CLIENT", project: "E-commerce Platform", participants: 4 },
      start: utc(2026, 4, 20, 14),
      end: utc(2026, 4, 20, 15),
      organizerId: adminEmployee.id,
      attendees: 4,
    },
    {
      title: "[SEED_UI_MEET] Release planning",
      meta: { status: "COMPLETED", kind: "TEAM", project: "Mobile App Development", participants: 7 },
      start: utc(2026, 4, 18, 10),
      end: utc(2026, 4, 18, 11, 30),
      organizerId: adminEmployee.id,
      attendees: 5,
    },
    {
      title: "[SEED_UI_MEET] Bug triage",
      meta: { status: "COMPLETED", kind: "TEAM", project: "Admin Panel", participants: 5 },
      start: utc(2026, 4, 22, 16),
      end: utc(2026, 4, 22, 17),
      organizerId: byEmail("employee.raju@mailinator.com").id,
      attendees: 5,
    },
    {
      title: "[SEED_UI_MEET] Town hall",
      meta: { status: "CANCELLED", kind: "TEAM", project: "PRIMA", participants: 8 },
      start: utc(2026, 4, 27, 15),
      end: utc(2026, 4, 27, 16),
      organizerId: adminEmployee.id,
      attendees: 6,
    },
  ];

  for (const m of meetRows) {
    const ev = await prisma.calendarEvent.create({
      data: {
        title: m.title,
        description: meetDesc(m.meta),
        startDateTime: m.start,
        endDateTime: m.end,
        isAllDay: false,
        eventType: "MEETING",
        organizerId: m.organizerId,
      },
    });
    await attachAttendees(ev.id, m.attendees);
  }

  await prisma.projectReport.create({
    data: {
      projectId: pWeb.id,
      reportType: "WEEKLY",
      totalTasks: 8,
      completedTasks: 3,
      overdueTasks: 1,
      totalHours: 120,
      actualHours: 96,
      generatedById: adminEmployee.id,
      progressData: { phases: ["Discovery", "Build", "QA"], pct: [30, 55, 15] },
    },
  });

  await prisma.projectReport.create({
    data: {
      projectId: pEcom.id,
      reportType: "MONTHLY",
      totalTasks: 10,
      completedTasks: 4,
      overdueTasks: 2,
      totalHours: 200,
      actualHours: 140,
      generatedById: adminEmployee.id,
      progressData: { burnDown: [40, 32, 28, 22] },
    },
  });

  await prisma.attendancePolicy.deleteMany({
    where: { companyId: company.id, policyName: "Default HQ Policy" },
  });

  await prisma.attendancePolicy.create({
    data: {
      companyId: company.id,
      policyName: "Default HQ Policy",
      description: "Seeded attendance policy",
      effectiveFrom: utc(2026, 1, 1),
      status: PolicyStatus.ACTIVE,
      createdBy: adminEmployee.id,
      approvedBy: adminEmployee.id,
    },
  });

  await prisma.regularizationRequest.deleteMany({
    where: { reason: "SEED_RICH: Forgot checkout — please regularize" },
  });

  const att = teamEmployees[3]
    ? await prisma.attendance.findFirst({
        where: { employeeId: teamEmployees[3].id },
      })
    : null;
  if (att && teamEmployees[3]) {
    await prisma.regularizationRequest.create({
      data: {
        employeeId: teamEmployees[3].id,
        attendanceId: att.id,
        requestType: RegularizationType.MISSED_PUNCH,
        reason: "SEED_RICH: Forgot checkout — please regularize",
        status: RequestStatus.PENDING,
        proposedCheckOut: utc(2026, 4, 29, 18),
      },
    });
  }

  await prisma.notificationRecipient.deleteMany({
    where: {
      notification: {
        createdById: adminEmployee.id,
        OR: [
          { title: "Leave request pending your approval" },
          { metadata: { equals: { seedLeaveNotif: true } } },
        ],
      },
    },
  });
  await prisma.notification.deleteMany({
    where: {
      createdById: adminEmployee.id,
      OR: [
        { title: "Leave request pending your approval" },
        { metadata: { equals: { seedLeaveNotif: true } } },
      ],
    },
  });

  const leaveNotifSpecs = [
    { title: "New leave request: Meenu Rani", message: "Casual leave is pending your review." },
    { title: "New leave request: Raman Kumar", message: "Sick leave is pending your review." },
    { title: "New leave request: Mishri Rani", message: "Casual leave is pending your review." },
  ];
  for (let i = 0; i < leaveNotifSpecs.length; i++) {
    const spec = leaveNotifSpecs[i]!;
    const refId = pendingLeaveIdsForNotifs[i];
    if (refId == null) continue;
    const n = await prisma.notification.create({
      data: {
        title: spec.title,
        message: spec.message,
        type: NotificationType.PROJECT_UPDATED,
        createdById: adminEmployee.id,
        referenceType: "leave",
        referenceId: refId,
        metadata: { seedLeaveNotif: true },
      },
    });
    await prisma.notificationRecipient.create({
      data: { notificationId: n.id, recipientId: adminEmployee.id, isRead: false },
    });
  }

  console.log(
    `✅ Rich demo: ${teamEmployees.length} team members, 4 projects, ${taskDefs.length} tasks, attendance, leaves, notifications, meetings, timesheets, reports, approvals.`
  );
  console.log(
    "   PRIMA team logins (password Admin@123): employee.meenu@…, manager.rakshi@…, hr.sonia@…; company admin hr.test3@mailinator.com"
  );
}
