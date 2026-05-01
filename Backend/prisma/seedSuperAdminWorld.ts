/**
 * Super-admin oriented seed: tenant companies + CEO accounts + dummy projects/tasks.
 * Project/task shapes are driven by SEED_BLUEPRINTS (iterated at runtime, not duplicated logic).
 * Removes legacy PRJ-DEMO* project graphs if present.
 */
import type { PrismaClient } from "@prisma/client";
import {
  DepartmentType,
  Designation,
  ProjectStatus,
  Role,
  Status,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

const DEMO_PREFIX = "PRJ-DEMO";
const SEED_PROJECT_PREFIX = "PRJ-SEED";
const SEED_TASK_PREFIX = "TASK-SEED";

type SeedTaskBlueprint = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  /** Rough due offset in weeks from seed run (deterministic UX) */
  dueWeekOffset: number;
};

type SeedProjectBlueprint = {
  suffix: string;
  name: string;
  description: string;
  progress: number;
  status: ProjectStatus;
  tasks: readonly SeedTaskBlueprint[];
};

/** 10 projects × 2 tasks each = 20 tasks; add rows here — loops consume this list. */
const SEED_BLUEPRINTS: SeedProjectBlueprint[] = [
  {
    suffix: "ROAD",
    name: "Platform Roadmap",
    description: "Quarterly delivery milestones and internal enablement",
    progress: 38,
    status: ProjectStatus.ACTIVE,
    tasks: [
      {
        title: "Prioritize backlog for next release",
        description: "Rank epics against capacity and dependency risk",
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueWeekOffset: 1,
      },
      {
        title: "Executive roadmap review",
        description: "One-pager outcomes and KPIs",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueWeekOffset: 3,
      },
    ],
  },
  {
    suffix: "CS",
    name: "Customer Success",
    description: "Onboarding, health checks, and expansion plays",
    progress: 52,
    status: ProjectStatus.ACTIVE,
    tasks: [
      {
        title: "Draft onboarding checklist v2",
        description: "Tooling + comms timeline for enterprise tier",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.IN_REVIEW,
        dueWeekOffset: 2,
      },
      {
        title: "QBR slide template refresh",
        description: "Usage, wins, renewal risks",
        priority: TaskPriority.LOW,
        status: TaskStatus.TODO,
        dueWeekOffset: 6,
      },
    ],
  },
  {
    suffix: "INFRA",
    name: "Cloud Reliability",
    description: "SLO targets, alerting, and incident tooling",
    progress: 44,
    status: ProjectStatus.ACTIVE,
    tasks: [
      {
        title: "Tune error budgets on core API",
        description: "Charts + paging thresholds",
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueWeekOffset: 1,
      },
      {
        title: "Backup restore dry run",
        description: "Quarterly validation + runbook tweaks",
        priority: TaskPriority.URGENT,
        status: TaskStatus.TODO,
        dueWeekOffset: 4,
      },
    ],
  },
  {
    suffix: "SEC",
    name: "Security & Compliance",
    description: "Access reviews, SSO hardening, audit prep",
    progress: 33,
    status: ProjectStatus.ON_HOLD,
    tasks: [
      {
        title: "Vendor access attestation",
        description: "Quarterly attest with owners sign-off",
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
        dueWeekOffset: 8,
      },
      {
        title: "SOC2 evidence pull",
        description: "Sample tickets and screenshots",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueWeekOffset: 10,
      },
    ],
  },
  {
    suffix: "MOBILE",
    name: "Mobile Experience",
    description: "iOS/Android parity and release train",
    progress: 47,
    status: ProjectStatus.ACTIVE,
    tasks: [
      {
        title: "Offline mode spike",
        description: "Local cache boundaries",
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
        dueWeekOffset: 5,
      },
      {
        title: "Release notes localization",
        description: "EN + rollout bundle",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.COMPLETED,
        dueWeekOffset: -2,
      },
    ],
  },
  {
    suffix: "DATA",
    name: "Analytics Pipeline",
    description: "Warehousing, KPI models, dashboards",
    progress: 29,
    status: ProjectStatus.PLANNING,
    tasks: [
      {
        title: "Canonical event schema doc",
        description: "Versioned fields + examples",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.IN_PROGRESS,
        dueWeekOffset: 2,
      },
      {
        title: "Marketing funnel dashboard",
        description: "Attribution MVP",
        priority: TaskPriority.LOW,
        status: TaskStatus.TODO,
        dueWeekOffset: 7,
      },
    ],
  },
  {
    suffix: "HRTECH",
    name: "Internal HR Ops",
    description: "Policy workflows, approvals, integrations",
    progress: 41,
    status: ProjectStatus.ACTIVE,
    tasks: [
      {
        title: "Roll out PTO accrual rules",
        description: "Config + QA in staging",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.IN_REVIEW,
        dueWeekOffset: 3,
      },
      {
        title: "Manager training brief",
        description: "Record + FAQ",
        priority: TaskPriority.LOW,
        status: TaskStatus.TODO,
        dueWeekOffset: 5,
      },
    ],
  },
  {
    suffix: "OPS",
    name: "Business Operations",
    description: "Procurement, vendor renewals, cost guardrails",
    progress: 36,
    status: ProjectStatus.ACTIVE,
    tasks: [
      {
        title: "Software license inventory",
        description: "Reconcile seats vs usage",
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueWeekOffset: 2,
      },
      {
        title: "Vendor renewal calendar",
        description: "90/60/30 day reminders",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueWeekOffset: 4,
      },
    ],
  },
  {
    suffix: "MK",
    name: "Go-to-Market",
    description: "Campaigns, partner enablement, collateral",
    progress: 22,
    status: ProjectStatus.PLANNING,
    tasks: [
      {
        title: "Landing page experiments brief",
        description: "Hypotheses + success metrics",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueWeekOffset: 9,
      },
      {
        title: "Partner co-marketing toolkit",
        description: "Logos, copy, MDF guidelines",
        priority: TaskPriority.LOW,
        status: TaskStatus.TODO,
        dueWeekOffset: 11,
      },
    ],
  },
  {
    suffix: "SUPP",
    name: "Support Excellence",
    description: "SLAs, macros, escalation paths",
    progress: 55,
    status: ProjectStatus.ACTIVE,
    tasks: [
      {
        title: "Tier-1 macros refresh",
        description: "Top 20 intents",
        priority: TaskPriority.HIGH,
        status: TaskStatus.COMPLETED,
        dueWeekOffset: -1,
      },
      {
        title: "Weekend paging matrix",
        description: "Roster + handoff checklist",
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
        dueWeekOffset: 1,
      },
    ],
  },
];

function assertSeedShape(): void {
  if (SEED_BLUEPRINTS.length !== 10) throw new Error("SEED_BLUEPRINTS must define 10 projects");
  const nTasks = SEED_BLUEPRINTS.reduce((n, bp) => n + bp.tasks.length, 0);
  if (nTasks !== 20) throw new Error(`SEED_BLUEPRINTS tasks must sum to 20 (got ${nTasks})`);
  const suf = new Set(SEED_BLUEPRINTS.map((b) => b.suffix));
  if (suf.size !== SEED_BLUEPRINTS.length) throw new Error("SEED_BLUEPRINT suffixes must be unique");
}
assertSeedShape();

function taskProgressForStatus(status: TaskStatus): number {
  switch (status) {
    case TaskStatus.COMPLETED:
      return 100;
    case TaskStatus.IN_PROGRESS:
      return 45;
    case TaskStatus.IN_REVIEW:
      return 80;
    case TaskStatus.CANCELLED:
      return 0;
    default:
      return 10;
  }
}

function dueDateForOffset(weeks: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return d;
}

export async function cleanupLegacyDemoProjects(prisma: PrismaClient): Promise<void> {
  const demoProjects = await prisma.project.findMany({
    where: { code: { startsWith: DEMO_PREFIX } },
    select: { id: true },
  });
  const ids = demoProjects.map((p) => p.id);
  if (ids.length === 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.taskDependency.deleteMany({
      where: {
        OR: [
          { predecessorTask: { projectId: { in: ids } } },
          { dependentTask: { projectId: { in: ids } } },
        ],
      },
    });
    await tx.taskReport.deleteMany({
      where: { task: { projectId: { in: ids } } },
    });
    await tx.taskAttachment.deleteMany({
      where: { task: { projectId: { in: ids } } },
    });
    await tx.taskComment.deleteMany({
      where: { task: { projectId: { in: ids } } },
    });
    await tx.taskTimeEntry.deleteMany({
      where: { task: { projectId: { in: ids } } },
    });
    await tx.task.deleteMany({ where: { projectId: { in: ids } } });
    await tx.milestone.deleteMany({ where: { projectId: { in: ids } } });
    await tx.projectMember.deleteMany({ where: { projectId: { in: ids } } });
    await tx.projectReport.deleteMany({ where: { projectId: { in: ids } } });
    await tx.project.deleteMany({ where: { id: { in: ids } } });
  });
}

/** Idempotent dummy projects + tasks for CEO/admin demos (data from SEED_BLUEPRINTS). */
export async function seedDummyProjects(prisma: PrismaClient): Promise<void> {
  console.log(`📁 Seeding dummy projects (${SEED_PROJECT_PREFIX}-*) and tasks (${SEED_TASK_PREFIX}-*)…`);

  const companies = await prisma.company.findMany({
    where: { isActive: true },
    select: { id: true, code: true },
    orderBy: { id: "asc" },
  });

  let projectCount = 0;
  let taskCount = 0;

  for (const c of companies) {
    const department =
      (await prisma.department.findFirst({
        where: { companyId: c.id, name: "IT" },
      })) ??
      (await prisma.department.findFirst({
        where: { companyId: c.id, name: "Management" },
      }));
    if (!department) {
      console.warn(`⚠️ No IT/Management dept for company ${c.code} — skip projects`);
      continue;
    }

    let owner = await prisma.employee.findFirst({
      where: { companyId: c.id, employeeCode: { startsWith: "CEO" } },
    });
    if (!owner) {
      owner = await prisma.employee.findFirst({
        where: { companyId: c.id },
        orderBy: { id: "asc" },
      });
    }
    if (!owner) {
      console.warn(`⚠️ No employee to own projects for ${c.code} — skip`);
      continue;
    }

    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date();
    end.setMonth(end.getMonth() + 5);

    for (const bp of SEED_BLUEPRINTS) {
      const code = `${SEED_PROJECT_PREFIX}-${c.code}-${bp.suffix}`;
      const project = await prisma.project.upsert({
        where: { code },
        update: {
          name: bp.name,
          description: bp.description,
          companyId: c.id,
          departmentId: department.id,
          ownerId: owner.id,
          status: bp.status,
          progressPercentage: bp.progress,
          startDate: start,
          endDate: end,
          isActive: true,
        },
        create: {
          name: bp.name,
          description: bp.description,
          code,
          companyId: c.id,
          departmentId: department.id,
          ownerId: owner.id,
          status: bp.status,
          progressPercentage: bp.progress,
          startDate: start,
          endDate: end,
          isActive: true,
          members: { connect: [{ id: owner.id }] },
        },
      });
      projectCount += 1;

      let taskIx = 0;
      for (const tk of bp.tasks) {
        taskIx += 1;
        const taskCode = `${SEED_TASK_PREFIX}-${c.code}-${bp.suffix}-${taskIx}`;
        const due = dueDateForOffset(tk.dueWeekOffset);
        const progressPercentage = taskProgressForStatus(tk.status);
        const completedAt = tk.status === TaskStatus.COMPLETED ? dueDateForOffset(Math.min(0, tk.dueWeekOffset)) : null;

        const existing = await prisma.task.findFirst({ where: { code: taskCode } });
        if (existing) {
          await prisma.task.update({
            where: { id: existing.id },
            data: {
              title: tk.title,
              description: tk.description,
              projectId: project.id,
              assignedToId: owner.id,
              createdById: owner.id,
              status: tk.status,
              priority: tk.priority,
              dueDate: due,
              startDate: start,
              isActive: true,
              progressPercentage,
              completedAt,
            },
          });
        } else {
          await prisma.task.create({
            data: {
              title: tk.title,
              description: tk.description,
              code: taskCode,
              projectId: project.id,
              assignedToId: owner.id,
              createdById: owner.id,
              status: tk.status,
              priority: tk.priority,
              dueDate: due,
              startDate: start,
              isActive: true,
              progressPercentage,
              completedAt,
            },
          });
        }
        taskCount += 1;
      }
    }
  }

  console.log(
    `✅ Upserted ${projectCount} projects (${SEED_PROJECT_PREFIX}-*) and ${taskCount} tasks (${SEED_TASK_PREFIX}-*)`
  );
}

type TenantSeed = {
  name: string;
  code: string;
  ceoEmail: string;
  firstName: string;
  lastName: string;
  phone: string;
};

const TENANT_COUNT = 20;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** 20 companies + 20 CEOs; phones and ceoIds omit + and - */
function buildTenants(): TenantSeed[] {
  return Array.from({ length: TENANT_COUNT }, (_, i) => {
    const num = i + 1;
    const code = `TNT${pad2(num)}`;
    return {
      name: `Tenant Corporation ${pad2(num)}`,
      code,
      ceoEmail: `ceo.tnt${pad2(num)}@mailinator.com`,
      firstName: "Lead",
      lastName: `Executive${pad2(num)}`,
      phone: `919000100${String(num).padStart(3, "0")}`,
    };
  });
}

export async function seedSuperAdminWorld(
  prisma: PrismaClient,
  passwordHash: string
): Promise<void> {
  console.log("🌐 Seeding tenant companies + CEO accounts…");

  await cleanupLegacyDemoProjects(prisma);

  const tenants = buildTenants();

  for (const t of tenants) {
    const company = await prisma.company.upsert({
      where: { code: t.code },
      update: { name: t.name, isActive: true },
      create: {
        name: t.name,
        code: t.code,
        isActive: true,
      },
    });

    const managementDept = await prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Management" } },
      update: {},
      create: {
        name: "Management",
        type: DepartmentType.OPERATIONS,
        companyId: company.id,
      },
    });

    const ceoId = `CEO${t.code}`;
    const email = t.ceoEmail.toLowerCase();

    const ceoUser = await prisma.user.upsert({
      where: { email },
      update: {
        firstName: t.firstName,
        lastName: t.lastName,
        phone: t.phone,
        designation: "CEO",
        role: Role.ADMIN,
        status: Status.ACTIVE,
        isActive: true,
        isVerified: true,
        companyId: company.id,
        password: passwordHash,
        ceoId,
      },
      create: {
        email,
        firstName: t.firstName,
        lastName: t.lastName,
        phone: t.phone,
        designation: "CEO",
        role: Role.ADMIN,
        status: Status.ACTIVE,
        isActive: true,
        isVerified: true,
        companyId: company.id,
        password: passwordHash,
        ceoId,
      },
    });

    const other = await prisma.employee.findUnique({ where: { userId: ceoUser.id } });
    if (other && other.employeeCode !== ceoId) {
      await prisma.employee.delete({ where: { id: other.id } });
    }

    await prisma.employee.upsert({
      where: { employeeCode: ceoId },
      update: {
        userId: ceoUser.id,
        companyId: company.id,
        departmentId: managementDept.id,
        name: `${t.firstName} ${t.lastName}`.trim(),
        designation: Designation.MANAGER,
        isActive: true,
      },
      create: {
        userId: ceoUser.id,
        companyId: company.id,
        departmentId: managementDept.id,
        name: `${t.firstName} ${t.lastName}`.trim(),
        designation: Designation.MANAGER,
        employeeCode: ceoId,
        isActive: true,
      },
    });
  }

  console.log(`✅ ${tenants.length} companies with CEO logins (password Admin@123), e.g. ${tenants[0]!.ceoEmail}`);

  await seedDummyProjects(prisma);
}
