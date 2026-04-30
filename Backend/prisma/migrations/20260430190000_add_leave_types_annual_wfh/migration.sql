-- AlterEnum: add leave types used by demo / HR UI (runs once per database)
ALTER TYPE "LeaveType" ADD VALUE 'ANNUAL';
ALTER TYPE "LeaveType" ADD VALUE 'WORK_FROM_HOME';
