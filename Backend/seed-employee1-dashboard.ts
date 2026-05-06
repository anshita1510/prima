import { PrismaClient, TaskStatus, TaskPriority, LeaveType, LeaveStatus, AttendanceStatus, ProjectStatus, ProjectRole } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seedEmployee1Dashboard() {
    console.log('\n🌱 SEEDING EMPLOYEE1 DASHBOARD DATA\n');
    console.log('='.repeat(80));

    try {
        // Get employee1
        const user = await prisma.user.findUnique({
            where: { email: 'employee1@mailinator.com' },
            include: { employee: true }
        });

        if (!user || !user.employee) {
            console.log('❌ employee1 not found or not linked to employee record');
            return;
        }

        const employee = user.employee;
        console.log(`✅ Found employee: ${user.firstName} ${user.lastName}`);
        console.log(`   Employee ID: ${employee.id}`);
        console.log(`   Company ID: ${employee.companyId}`);
        console.log(`   Department ID: ${employee.departmentId}\n`);

        // Clean existing data for employee1
        console.log('🧹 Cleaning existing data...');
        await prisma.taskTimeEntry.deleteMany({ where: { employeeId: employee.id } });
        await prisma.taskComment.deleteMany({ where: { authorId: employee.id } });
        await prisma.taskAttachment.deleteMany({ where: { uploadedById: employee.id } });
        await prisma.task.deleteMany({ where: { OR: [{ assignedToId: employee.id }, { createdById: employee.id }] } });
        await prisma.projectMember.deleteMany({ where: { employeeId: employee.id } });
        await prisma.calendarEventAttendee.deleteMany({ where: { attendeeId: employee.id } });
        await prisma.calendarEvent.deleteMany({ where: { organizerId: employee.id } });
        await prisma.leave.deleteMany({ where: { employeeId: employee.id } });
        await prisma.attendance.deleteMany({ where: { employeeId: employee.id } });
        console.log('✅ Cleaned existing data\n');

        // 1. CREATE ATTENDANCE DATA (Last 30 days)
        console.log('📅 Creating attendance records...');
        const attendanceRecords = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dayOfWeek = date.getDay();

            // Skip weekends
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;

            // Determine status (mostly present, some variations)
            let status: AttendanceStatus;
            let checkIn: Date | null = null;
            let checkOut: Date | null = null;
            let workHours: number | null = null;

            const random = Math.random();

            if (i === 0) {
                // Today - checked in but not out yet
                status = AttendanceStatus.PRESENT;
                checkIn = new Date(date);
                checkIn.setHours(9, Math.floor(Math.random() * 30), 0);
                workHours = null;
            } else if (random < 0.85) {
                // 85% present
                status = AttendanceStatus.PRESENT;
                checkIn = new Date(date);
                checkIn.setHours(9, Math.floor(Math.random() * 30), 0);
                checkOut = new Date(date);
                checkOut.setHours(18, Math.floor(Math.random() * 60), 0);
                workHours = 8 + (Math.random() * 2 - 0.5); // 7.5 to 9.5 hours
            } else if (random < 0.90) {
                // 5% late
                status = AttendanceStatus.LATE;
                checkIn = new Date(date);
                checkIn.setHours(10, Math.floor(Math.random() * 30), 0);
                checkOut = new Date(date);
                checkOut.setHours(19, Math.floor(Math.random() * 60), 0);
                workHours = 8 + (Math.random() * 1);
            } else if (random < 0.95) {
                // 5% half day
                status = AttendanceStatus.HALF_DAY;
                checkIn = new Date(date);
                checkIn.setHours(9, Math.floor(Math.random() * 30), 0);
                checkOut = new Date(date);
                checkOut.setHours(13, Math.floor(Math.random() * 60), 0);
                workHours = 4;
            } else {
                // 5% leave
                status = AttendanceStatus.LEAVE;
            }

            attendanceRecords.push({
                employeeId: employee.id,
                companyId: employee.companyId,
                departmentId: employee.departmentId,
                date,
                status,
                checkIn,
                checkOut,
                workHours,
                isLocked: i > 7, // Lock records older than 7 days
            });
        }

        await prisma.attendance.createMany({ data: attendanceRecords });
        console.log(`✅ Created ${attendanceRecords.length} attendance records\n`);

        // 2. CREATE LEAVE RECORDS
        console.log('🏖️ Creating leave records...');
        const leaves = [
            {
                employeeId: employee.id,
                departmentId: employee.departmentId,
                type: LeaveType.CASUAL,
                status: LeaveStatus.APPROVED,
                reason: 'Family function',
                startDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
                endDate: new Date(today.getFullYear(), today.getMonth() - 1, 16),
            },
            {
                employeeId: employee.id,
                departmentId: employee.departmentId,
                type: LeaveType.SICK,
                status: LeaveStatus.APPROVED,
                reason: 'Fever and cold',
                startDate: new Date(today.getFullYear(), today.getMonth(), 5),
                endDate: new Date(today.getFullYear(), today.getMonth(), 5),
            },
            {
                employeeId: employee.id,
                departmentId: employee.departmentId,
                type: LeaveType.WORK_FROM_HOME,
                status: LeaveStatus.PENDING,
                reason: 'Internet installation at home',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
            },
            {
                employeeId: employee.id,
                departmentId: employee.departmentId,
                type: LeaveType.ANNUAL,
                status: LeaveStatus.PENDING,
                reason: 'Vacation trip',
                startDate: new Date(today.getFullYear(), today.getMonth() + 1, 10),
                endDate: new Date(today.getFullYear(), today.getMonth() + 1, 14),
            },
        ];

        await prisma.leave.createMany({ data: leaves });
        console.log(`✅ Created ${leaves.length} leave records\n`);

        // 3. CREATE PROJECTS
        console.log('📊 Creating projects...');
        const timestamp = Date.now().toString().slice(-6);
        const project1 = await prisma.project.create({
            data: {
                name: 'E-Commerce Platform Redesign',
                description: 'Complete redesign of the company e-commerce platform with modern UI/UX',
                code: `ECOM-${timestamp}`,
                companyId: employee.companyId,
                departmentId: employee.departmentId,
                ownerId: employee.id,
                status: ProjectStatus.ACTIVE,
                startDate: new Date(today.getFullYear(), today.getMonth() - 2, 1),
                endDate: new Date(today.getFullYear(), today.getMonth() + 2, 30),
                budget: 50000,
                progressPercentage: 45,
            }
        });

        const project2 = await prisma.project.create({
            data: {
                name: 'Mobile App Development',
                description: 'Native mobile application for iOS and Android',
                code: `MOB-${timestamp}`,
                companyId: employee.companyId,
                departmentId: employee.departmentId,
                ownerId: employee.id,
                status: ProjectStatus.ACTIVE,
                startDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
                endDate: new Date(today.getFullYear(), today.getMonth() + 3, 15),
                budget: 75000,
                progressPercentage: 30,
            }
        });

        const project3 = await prisma.project.create({
            data: {
                name: 'API Integration Project',
                description: 'Integration with third-party payment and shipping APIs',
                code: `API-${timestamp}`,
                companyId: employee.companyId,
                departmentId: employee.departmentId,
                ownerId: employee.id,
                status: ProjectStatus.PLANNING,
                startDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
                endDate: new Date(today.getFullYear(), today.getMonth() + 4, 30),
                budget: 30000,
                progressPercentage: 10,
            }
        });

        // Add employee as project member
        await prisma.projectMember.createMany({
            data: [
                { projectId: project1.id, employeeId: employee.id, role: ProjectRole.OWNER },
                { projectId: project2.id, employeeId: employee.id, role: ProjectRole.OWNER },
                { projectId: project3.id, employeeId: employee.id, role: ProjectRole.OWNER },
            ]
        });

        console.log(`✅ Created 3 projects\n`);

        // 4. CREATE TASKS
        console.log('✅ Creating tasks...');
        const tasks = [
            // Project 1 tasks
            {
                title: 'Design Homepage Mockup',
                description: 'Create high-fidelity mockup for the new homepage design',
                projectId: project1.id,
                assignedToId: employee.id,
                createdById: employee.id,
                status: TaskStatus.COMPLETED,
                priority: TaskPriority.HIGH,
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10),
                completedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
                estimatedHours: 16,
                actualHours: 14,
                progressPercentage: 100,
            },
            {
                title: 'Implement Product Listing Page',
                description: 'Develop responsive product listing page with filters and sorting',
                projectId: project1.id,
                assignedToId: employee.id,
                createdById: employee.id,
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.HIGH,
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
                estimatedHours: 24,
                actualHours: 16,
                progressPercentage: 65,
            },
            {
                title: 'Shopping Cart Integration',
                description: 'Integrate shopping cart functionality with backend API',
                projectId: project1.id,
                assignedToId: employee.id,
                createdById: employee.id,
                status: TaskStatus.TODO,
                priority: TaskPriority.MEDIUM,
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
                estimatedHours: 20,
                progressPercentage: 0,
            },
            {
                title: 'Payment Gateway Setup',
                description: 'Configure and test payment gateway integration',
                projectId: project1.id,
                assignedToId: employee.id,
                createdById: employee.id,
                status: TaskStatus.TODO,
                priority: TaskPriority.URGENT,
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
                estimatedHours: 16,
                progressPercentage: 0,
            },
            // Project 2 tasks
            {
                title: 'Setup React Native Project',
                description: 'Initialize React Native project with required dependencies',
                projectId: project2.id,
                assignedToId: employee.id,
                createdById: employee.id,
                status: TaskStatus.COMPLETED,
                priority: TaskPriority.HIGH,
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 15),
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20),
                completedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 15),
                estimatedHours: 8,
                actualHours: 6,
                progressPercentage: 100,
            },
            {
                title: 'Design App Navigation',
                description: 'Implement bottom tab navigation and drawer navigation',
                projectId: project2.id,
                assignedToId: employee.id,
                createdById: employee.id,
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.MEDIUM,
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
                estimatedHours: 12,
                actualHours: 8,
                progressPercentage: 70,
            },
            {
                title: 'User Authentication Flow',
                description: 'Implement login, signup, and forgot password screens',
                projectId: project2.id,
                assignedToId: employee.id,
                createdById: employee.id,
                status: TaskStatus.IN_REVIEW,
                priority: TaskPriority.HIGH,
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
                estimatedHours: 20,
                actualHours: 22,
                progressPercentage: 95,
            },
            {
                title: 'Push Notifications Setup',
                description: 'Configure Firebase Cloud Messaging for push notifications',
                projectId: project2.id,
                assignedToId: employee.id,
                createdById: employee.id,
                status: TaskStatus.TODO,
                priority: TaskPriority.MEDIUM,
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
                estimatedHours: 16,
                progressPercentage: 0,
            },
            // Project 3 tasks
            {
                title: 'API Documentation Review',
                description: 'Review third-party API documentation and requirements',
                projectId: project3.id,
                assignedToId: employee.id,
                createdById: employee.id,
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.MEDIUM,
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
                estimatedHours: 8,
                actualHours: 4,
                progressPercentage: 50,
            },
            {
                title: 'Create API Wrapper Service',
                description: 'Develop service layer for API communication',
                projectId: project3.id,
                assignedToId: employee.id,
                createdById: employee.id,
                status: TaskStatus.TODO,
                priority: TaskPriority.LOW,
                dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 5),
                estimatedHours: 24,
                progressPercentage: 0,
            },
        ];

        for (const taskData of tasks) {
            await prisma.task.create({ data: taskData });
        }

        console.log(`✅ Created ${tasks.length} tasks\n`);

        // 5. CREATE CALENDAR EVENTS
        console.log('📆 Creating calendar events...');
        const events = [
            {
                title: 'Sprint Planning Meeting',
                description: 'Plan tasks for the upcoming sprint',
                startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0),
                endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 30),
                eventType: 'meeting',
                organizerId: employee.id,
            },
            {
                title: 'Code Review Session',
                description: 'Review pull requests and discuss code quality',
                startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0),
                endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 0),
                eventType: 'meeting',
                organizerId: employee.id,
            },
            {
                title: 'Client Demo',
                description: 'Demonstrate new features to the client',
                startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 15, 0),
                endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 16, 0),
                eventType: 'meeting',
                organizerId: employee.id,
            },
            {
                title: 'Team Standup',
                description: 'Daily standup meeting',
                startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
                endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 45),
                eventType: 'meeting',
                organizerId: employee.id,
                isRecurring: true,
                recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR',
            },
            {
                title: 'Project Deadline',
                description: 'E-Commerce Platform Phase 1 completion',
                startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 0, 0),
                endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 23, 59),
                eventType: 'deadline',
                isAllDay: true,
                organizerId: employee.id,
            },
            {
                title: 'Training: Advanced React Patterns',
                description: 'Internal training session on advanced React patterns',
                startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 13, 0),
                endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 15, 0),
                eventType: 'training',
                organizerId: employee.id,
            },
        ];

        for (const eventData of events) {
            const event = await prisma.calendarEvent.create({ data: eventData });
            // Add employee as attendee
            await prisma.calendarEventAttendee.create({
                data: {
                    eventId: event.id,
                    attendeeId: employee.id,
                    status: 'accepted',
                }
            });
        }

        console.log(`✅ Created ${events.length} calendar events\n`);

        // 6. ADD TASK COMMENTS AND TIME ENTRIES
        console.log('💬 Adding task comments and time entries...');

        const allTasks = await prisma.task.findMany({
            where: { assignedToId: employee.id }
        });

        // Add comments to some tasks
        const tasksWithComments = allTasks.slice(0, 5);
        for (const task of tasksWithComments) {
            await prisma.taskComment.create({
                data: {
                    taskId: task.id,
                    authorId: employee.id,
                    content: 'Working on this task. Making good progress!',
                }
            });
        }

        // Add time entries for in-progress and completed tasks
        const tasksWithTime = allTasks.filter(t =>
            t.status === TaskStatus.IN_PROGRESS ||
            t.status === TaskStatus.COMPLETED ||
            t.status === TaskStatus.IN_REVIEW
        );

        for (const task of tasksWithTime) {
            const entries = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < entries; i++) {
                const entryDate = new Date(today);
                entryDate.setDate(entryDate.getDate() - Math.floor(Math.random() * 7));
                const startTime = new Date(entryDate);
                startTime.setHours(9 + Math.floor(Math.random() * 4), 0, 0);
                const endTime = new Date(startTime);
                endTime.setHours(startTime.getHours() + 2 + Math.floor(Math.random() * 3), 0, 0);
                const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

                await prisma.taskTimeEntry.create({
                    data: {
                        taskId: task.id,
                        employeeId: employee.id,
                        startTime,
                        endTime,
                        duration,
                        description: 'Development work',
                    }
                });
            }
        }

        console.log('✅ Added comments and time entries\n');

        console.log('='.repeat(80));
        console.log('\n🎉 SEEDING COMPLETED SUCCESSFULLY!\n');
        console.log('📊 Summary:');
        console.log(`   ✅ Attendance: ${attendanceRecords.length} records`);
        console.log(`   ✅ Leaves: ${leaves.length} records`);
        console.log(`   ✅ Projects: 3 projects`);
        console.log(`   ✅ Tasks: ${tasks.length} tasks`);
        console.log(`   ✅ Calendar Events: ${events.length} events`);
        console.log(`   ✅ Comments: ${tasksWithComments.length} comments`);
        console.log(`   ✅ Time Entries: Multiple entries added`);
        console.log('\n💡 You can now login as employee1@mailinator.com and see the dashboard!\n');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

seedEmployee1Dashboard();
