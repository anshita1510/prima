<<<<<<< HEAD
# 🚀 Enterprise HR Management System (PRIMA Clone)

> A comprehensive, production-ready HR Management System with attendance tracking, leave management, project management, and role-based access control.

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [System Architecture](#-system-architecture)
5. [Access Roles & Permissions](#-access-roles--permissions)
6. [Setup & Installation](#-setup--installation)
7. [Environment Configuration](#-environment-configuration)
8. [Database Migrations](#-database-migrations)
9. [Running the Application](#-running-the-application)
10. [API Documentation](#-api-documentation)
11. [Project Structure](#-project-structure)
12. [Deployment](#-deployment)
13. [Contributing](#-contributing)

---

## 🎯 Overview

This Enterprise HR Management System is a full-stack application designed to streamline HR operations, attendance tracking, leave management, and project management. Built with modern technologies and following enterprise-grade best practices.

### Key Highlights

- **Multi-tenant Architecture**: Support for multiple companies
- **Role-Based Access Control (RBAC)**: 4 distinct user roles with granular permissions
- **Real-time Attendance Tracking**: Multiple check-in/check-out with geolocation
- **Advanced Leave Management**: Designation-based approval workflows
- **Project & Task Management**: Comprehensive project tracking with Gantt charts
- **Audit Trail**: Complete audit logging for compliance
- **RESTful API**: Well-documented API with Swagger/OpenAPI


## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Multi-provider support (Local, Google, Microsoft)
- Role-based access control (RBAC)
- Password reset with OTP verification
- Session management with token expiry


### 👥 User Management
- Employee onboarding with invite system
- Reporting hierarchy (Manager-Employee relationships)
- Employee profiles with designation tracking

### ⏰ Attendance Management
- Multiple check-in/check-out per day
- Real-time work hours calculation
- Geolocation tracking
- Attendance regularization requests
- Automated attendance policies

### 🏖️ Leave Management
- Multiple leave types (Casual, Sick, Earned, Unpaid)
- Designation-based approval workflows
- Manager and HR dual approval system
- Leave balance tracking
- Leave history and reports

### 📊 Project Management
- Project creation and tracking
- Task assignment and management
- Time tracking per task
- Project progress visualization
- Team member roles (Super Admin, Admin, Manager, Employee)
- Task dependencies
- Gantt chart view
- Project reports and analytics

### 📅 Calendar & Events
- Integrated calendar system
- Event creation and management
- Festival and holiday tracking
- Meeting scheduling
- Event attendee management

### 📈 Dashboard & Analytics
- Role-specific dashboards
- Real-time statistics
- Attendance trends with charts (Recharts)
- Task completion metrics
- Department performance radar charts
- Leave statistics
- Productivity tracking

### 🔔 Notifications
- Real-time notifications
- Email notifications (Nodemailer)
---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20+ | Runtime environment |
| **Express.js** | 5.2+ | Web framework |
| **TypeScript** | 5.9+ | Type-safe JavaScript |
| **Prisma** | 6.19+ | ORM and database toolkit |
| **PostgreSQL** | 16+ | Relational database |
| **JWT** | 9.0+ | Authentication tokens |
| **Bcrypt** | 6.0+ | Password hashing |
| **Zod** | 4.2+ | Schema validation |
| **Nodemailer** | 7.0+ | Email service |
| **Swagger** | 6.2+ | API documentation |
| **Node-cron** | 4.2+ | Scheduled tasks |
| **Helmet** | 8.1+ | Security headers |
| **CORS** | 2.8+ | Cross-origin resource sharing |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1+ | React framework |
| **TypeScript** | 5+ | Type-safe JavaScript |
| **Tailwind CSS** | 3.4+ | Utility-first CSS |
| **Radix UI** | Latest | Accessible components |
| **Recharts** | 3.6+ | Chart library |
| **Axios** | 1.13+ | HTTP client |
| **Class Variance Authority** | 0.7+ | Component variants |

### DevOps & Tools
- **Git** - Version control
- **npm** - Package manager
- **Nodemon** - Development server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Postman** - API testing

Code → Git Commit
     → ESLint + Prettier
     → Nodemon (Dev)
     → Postman (API test)
     → Push to GitLab


**TypeScript = JavaScript + Type Safety**


### Database: PostgreSQL + Prisma
---


```
┌─────────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY SYNERGY                            │
│                                                                  │
│  Next.js (Frontend)                                             │
│       ↓ TypeScript                                              │
│  Express (Backend)                                              │
│       ↓ TypeScript                                              │
│  Prisma (ORM)                                                   │
│       ↓ Type-safe queries                                       │
│  PostgreSQL (Database)                                          │
│                                                                  │
│  = End-to-end type safety from database to UI                   │
└──────────────────────────────────────────────────────────────────┘

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │    Mobile    │  │   Desktop    │          │
│  │  (Next.js)   │  │   (Future)   │  │   (Future)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────┐         │
│  │           Next.js Frontend (Port 3000)             │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │  Pages & Components                          │ │         │
│  │  │  - Authentication                            │ │         │
│  │  │  - Dashboards (Role-based)                   │ │         │
│  │  │  - Attendance Management                     │ │         │
│  │  │  - Leave Management                          │ │         │
│  │  │  - Project Management                        │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │  Services & API Clients                      │ │         │
│  │  │  - authService                               │ │         │
│  │  │  - attendanceService                         │ │         │
│  │  │  - leaveService                              │ │         │
│  │  │  - projectService                            │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  └────────────────────────────────────────────────────┘        │
│                           │                                    │
│                           │ HTTP/REST                          │
│                           │                                    │
│  ┌────────────────────────▼───────────────────────────┐        │
│  │         Express.js Backend (Port 5004)             │        │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │  Middleware Layer                            │ │         │
│  │  │  - Authentication (JWT)                      │ │         │
│  │  │  - Authorization (RBAC)                      │ │         │
│  │  │  - Validation (Zod)                          │ │         │
│  │  │  - Error Handling                            │ │         │
│  │  │                                              │ │         │
│  │  │  - Security (Helmet, CORS)                   │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │  Controllers                                 │ │         │
│  │  │  - Auth Controller                           │ │         │
│  │  │  - Attendance Controller                     │ │         │
│  │  │  - Leave Controller                          │ │         │
│  │  │  - Project Controller                        │ │         │
│  │  │  - User Controller                           │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │  Services (Business Logic)                   │ │         │
│  │  │  - attendanceService                         │ │         │
│  │  │  - leaveService                              │ │         │
│  │  │  - leaveApprovalService                      │ │         │
│  │  │  - projectService                            │ │         │
│  │  │  - emailService                              │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │  Prisma ORM                                  │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  └────────────────────────────────────────────────────┘         │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            │ SQL
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │         PostgreSQL Database (Port 5432)            │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │  Core Tables                                 │ │         │
│  │  │  - User, Employee, Company, Department       │ │         │
│  │  │  - Attendance, Leave, Project, Task          │ │         │
│  │  │  - Permissions, Roles, Audit Logs            │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  └────────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    SMTP      │  │    Google    │  │  Microsoft   │          │
│  │   (Email)    │  │    OAuth     │  │    OAuth     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action → Frontend (Next.js) → API Call (Axios) → Backend (Express)
    ↓
Middleware (Auth, Validation) → Controller → Service Layer
    ↓
Prisma ORM → PostgreSQL Database
    ↓
Response ← Service ← Controller ← Middleware ← Frontend ← User
```

---

## 👑 Access Roles & Permissions

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROLE HIERARCHY                              │
│                                                                  │
│                    ┌──────────────────┐                         │
│                    │  SUPER_ADMIN     │                         │
│                    │  (Director)      │                         │
│                    │  Full System     │                         │
│                    │  Access          │                         │
│                    └────────┬─────────┘                         │
│                             │                                    │
│              ┌──────────────┴──────────────┐                    │
│              │                             │                    │
│     ┌────────▼────────┐          ┌────────▼────────┐           │
│     │     ADMIN       │          │    MANAGER      │           │
│     │     (HR)        │          │  (Team Lead)    │           │
│     │  HR Operations  │          │  Team Mgmt      │           │
│     └────────┬────────┘          └────────┬────────┘           │
│              │                             │                    │
│              └──────────────┬──────────────┘                    │
│                             │                                    │
│                    ┌────────▼────────┐                          │
│                    │    EMPLOYEE     │                          │
│                    │  (Team Member)  │                          │
│                    │  Basic Access   │                          │
│                    └─────────────────┘                          │
└──────────────────────────────────────────────────────────────────┘
```

### Detailed Role Permissions

#### 1. SUPER_ADMIN (Director Level)
**Designation**: DIRECTOR

**Full System Access**:
- ✅ Complete system configuration
- ✅ Company management (create, update, delete)
- ✅ User management (all roles)
- ✅ Department management
- ✅ Attendance policy configuration
- ✅ Leave policy management
- ✅ System-wide reports and analytics
- ✅ Audit trail access
- ✅ Database backups and maintenance
- ✅ Security settings
- ✅ API key management
- ✅ Billing and subscription management

**Access Scope**: All companies, all departments, all employees

---

#### 2. ADMIN (HR Level)
**Designation**: HR

**HR Operations**:
- ✅ Employee onboarding and offboarding
- ✅ Attendance management (view, edit, approve)
- ✅ Leave approvals (final approval authority)
- ✅ Attendance regularization approvals
- ✅ Department-level reports
- ✅ Employee performance tracking
- ✅ Payroll data preparation
- ✅ Policy enforcement
- ✅ Compliance reporting
- ✅ Personal attendance tracking (dual role)

**Restrictions**:
- ❌ Cannot modify system configuration
- ❌ Cannot create/delete companies
- ❌ Cannot access other companies' data
- ❌ Cannot modify super admin accounts

**Access Scope**: Own company, all departments, all employees

---

#### 3. MANAGER (Team Lead Level)
**Designation**: MANAGER, TECH_LEAD

**Team Management**:
- ✅ Team member attendance view
- ✅ Leave approvals (first-level approval)
- ✅ Project creation and management
- ✅ Task assignment and tracking
- ✅ Team performance reports
- ✅ Attendance regularization review
- ✅ Team calendar management
- ✅ Personal attendance tracking (dual role)
- ✅ Subordinate management

**Restrictions**:
- ❌ Cannot approve own leave
- ❌ Cannot edit attendance policies
- ❌ Cannot access other departments (unless assigned)
- ❌ Cannot perform HR operations
- ❌ Limited to assigned projects/teams

**Access Scope**: Own department, direct reports, assigned projects

---

#### 4. EMPLOYEE (Team Member Level)
**Designation**: INTERN, SOFTWARE_ENGINEER, SENIOR_ENGINEER

**Personal Management**:
- ✅ Personal attendance (check-in/check-out)
- ✅ Leave application
- ✅ Attendance regularization requests
- ✅ Personal dashboard and reports
- ✅ Task management (assigned tasks)
- ✅ Project view (assigned projects)
- ✅ Calendar view
- ✅ Profile management

**Restrictions**:
- ❌ Cannot view other employees' data
- ❌ Cannot approve leaves
- ❌ Cannot create projects
- ❌ Cannot assign tasks to others
- ❌ Cannot access admin features
- ❌ Cannot modify attendance policies

**Access Scope**: Personal data only, assigned projects/tasks

---


---

### Designation-Based Approval Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│              LEAVE APPROVAL WORKFLOW                             │
│                                                                  │
│  Employee (INTERN, SOFTWARE_ENGINEER, SENIOR_ENGINEER)          │
│                           │                                      │
│                           │ Applies Leave                        │
│                           ▼                                      │
│                  ┌─────────────────┐                            │
│                  │  Leave Request  │                            │
│                  │   (PENDING)     │                            │
│                  └────────┬────────┘                            │
│                           │                                      │
│                           │                                      │
│         ┌─────────────────┴─────────────────┐                  │
│         │                                   │                  │
│         ▼                                   ▼                  │
│  ┌──────────────┐                   ┌──────────────┐          │
│  │   MANAGER    │                   │      HR      │          │
│  │  (Level 1)   │                   │  (Level 2)   │          │
│  │   Approval   │                   │   Approval   │          │
│  └──────┬───────┘                   └──────┬───────┘          │
│         │                                   │                  │
│         │ Approves                          │ Approves         │
│         ▼                                   ▼                  │
│  ┌──────────────┐                   ┌──────────────┐          │
│  │   PENDING    │────────────────▶  │   APPROVED   │          │
│  │  (HR Review) │                   │   (Final)    │          │
│  └──────────────┘                   └──────────────┘          │
│         │                                                       │
│         │ Rejects                                              │
│         ▼                                                       │
│  ┌──────────────┐                                              │
│  │   REJECTED   │                                              │
│  └──────────────┘                                              │
│                                                                │
│  Special Cases:                                                │
│  • Manager cannot approve own leave → Goes directly to HR      │
│  • HR cannot approve own leave → Requires Manager              │
│  • SUPER_ADMIN leave → Requires another SUPER_ADMIN            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup & Installation

### Prerequisites

Before you begin, ensure you have the following installed:


### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create .env file (see Environment Configuration section)
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

### Step 3: Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE PRIMA_database;
\q

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npm run seed
```

### Step 4: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd Frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

### Step 5: Verify Installation

```bash
# Check Node.js version
node --version  # Should be v20+

# Check npm version
npm --version   # Should be v10+

# Check PostgreSQL connection
psql -U postgres -d PRIMA_database -c "SELECT version();"

# Check Prisma
cd Backend
npx prisma --version
```

---

## 🔐 Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# ============================================
# APPLICATION CONFIGURATION
# ============================================
NODE_ENV=development
PORT=5004

# ============================================
# DATABASE CONFIGURATION
# ============================================
# PostgreSQL Connection String
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/PRIMA_database?schema=public"

# ============================================
# JWT CONFIGURATION
# ============================================
# Generate a secure secret: openssl rand -hex 32
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7d

# ============================================
# EMAIL CONFIGURATION (SMTP)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# For Gmail: Enable 2FA and generate App Password
# https://myaccount.google.com/apppasswords

# ============================================
# OAUTH CONFIGURATION (Optional)
# ============================================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5004/api/auth/google/callback

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:5004/api/auth/microsoft/callback

# ============================================
# FRONTEND URL
# ============================================
FRONTEND_URL=http://localhost:3000


### Frontend Environment Variables

Create a `.env.local` file in the `Frontend` directory:

```env
# ============================================
# API CONFIGURATION
# ============================================
NEXT_PUBLIC_API_URL=http://localhost:5004

# ============================================
# APPLICATION CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_NAME=Enterprise HR System
NEXT_PUBLIC_APP_VERSION=1.0.0

# ============================================
# OAUTH CONFIGURATION (Optional)
# ============================================
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your-microsoft-client-id

# ============================================
# FEATURE FLAGS
# ============================================
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=false
NEXT_PUBLIC_ENABLE_MICROSOFT_AUTH=false
NEXT_PUBLIC_ENABLE_MOBILE_APP=false

---

## 🗄️ Database Migrations

### Understanding Prisma Migrations

Prisma migrations track changes to your database schema over time. Each migration is a set of SQL statements that modify your database structure.

### Migration Commands

```bash
# Navigate to backend directory
cd Backend

# 1. Generate Prisma Client (after schema changes)
npx prisma generate

# 2. Create a new migration
npx prisma migrate dev --name <migration_name>
# Example: npx prisma migrate dev --name add_attendance_table

# 3. Apply pending migrations (development)
npx prisma migrate dev

# 4. Apply migrations (production)
npx prisma migrate deploy

# 5. Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# 6. View migration status
npx prisma migrate status

# 7. Resolve migration issues
npx prisma migrate resolve --applied <migration_name>

# 8. Open Prisma Studio (Database GUI)
npx prisma studio
```

### Migration Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIGRATION WORKFLOW                            │
│                                                                  │
│  1. Modify schema.prisma                                        │
│                  │                                               │
│                  ▼                                               │
│  2. npx prisma migrate dev --name <name>                        │
│                  │                                               │
│                  ├─▶ Creates migration SQL file                 │
│                  ├─▶ Applies migration to database              │
│                  └─▶ Generates Prisma Client                    │
│                  │                                               │
│                  ▼                                               │
│  3. Test changes locally                                        │
│                  │                                               │
│                  ▼                                               │
│  4. Commit migration files to Git                               │
│                  │                                               │
│                  ▼                                               │
│  5. Deploy to production                                        │
│                  │                                               │
│                  ▼                                               │
│  6. npx prisma migrate deploy (on production)                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```


## 🏃 Running the Application

### Development Mode

#### Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd Backend
npm run build
npm run dev
```
Backend will start on: `http://localhost:5004`

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run build
npm run dev
```
Frontend will start on: `http://localhost:3000`
```

### Accessing the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application UI |
| **Backend API** | http://localhost:5004 | REST API endpoints |
| **API Documentation** | http://localhost:5004/api-docs | Swagger UI |
| **Prisma Studio** | http://localhost:5555 | Database GUI |

### Default Login Credentials

After seeding the database, use these credentials:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Super Admin** | director@company.com | Admin@123 | Full system access |
| **Admin (HR)** | hr@company.com | Admin@123 | HR operations |
| **Manager** | manager@company.com | Manager@123 | Team management |
| **Employee** | employee@company.com | Employee@123 | Basic access |

⚠️ **Change these passwords immediately in production!**

### Health Check

```bash
# Check backend test
curl http://localhost:5004/test

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}


# 📚 API Documentation

### Swagger/OpenAPI Documentation

Access interactive API documentation at: **http://localhost:5004/api-docs**

### API Base URL

```
Development: http://localhost:5004/api
Production:  https://your-domain.com/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Core API Endpoints

#### Authentication

```http
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login
POST   /api/auth/logout            # Logout
POST   /api/auth/refresh-token     # Refresh JWT token
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password with OTP
POST   /api/auth/verify-otp        # Verify OTP
GET    /api/auth/me                # Get current user
```

#### User Management

```http
GET    /api/users                  # Get all users (Admin only)
GET    /api/users/:id              # Get user by ID
POST   /api/users                  # Create user (Admin only)
PUT    /api/users/:id              # Update user
DELETE /api/users/:id              # Delete user (Admin only)
POST   /api/users/invite           # Invite user (Admin only)
```

#### Employee Management

```http
GET    /api/employees              # Get all employees
GET    /api/employees/:id          # Get employee by ID
POST   /api/employees              # Create employee
PUT    /api/employees/:id          # Update employee
DELETE /api/employees/:id          # Delete employee
GET    /api/employees/department/:id  # Get employees by department
```

#### Attendance

```http
POST   /api/attendance/check-in    # Check in
POST   /api/attendance/check-out   # Check out
GET    /api/attendance/today       # Get today's attendance
GET    /api/attendance/my-records  # Get personal attendance history
GET    /api/attendance/employee/:id # Get employee attendance (Manager/Admin)
GET    /api/attendance/stats       # Get attendance statistics
POST   /api/attendance/regularize  # Request attendance regularization
PUT    /api/attendance/:id         # Update attendance (Admin only)
```

#### Leave Management

```http
POST   /api/leaves                 # Apply for leave
GET    /api/leaves                 # Get all leaves
GET    /api/leaves/:id             # Get leave by ID
PUT    /api/leaves/:id/approve     # Approve leave (Manager/Admin)
PUT    /api/leaves/:id/reject      # Reject leave (Manager/Admin)
GET    /api/leaves/my-leaves       # Get personal leaves
GET    /api/leaves/pending         # Get pending approvals (Manager/Admin)
GET    /api/leaves/balance         # Get leave balance
```

#### Project Management

```http
GET    /api/project-management                    # Get all projects
POST   /api/project-management                    # Create project
GET    /api/project-management/:id                # Get project by ID
PUT    /api/project-management/:id                # Update project
DELETE /api/project-management/:id                # Delete project
POST   /api/project-management/:id/members        # Add team member
DELETE /api/project-management/:id/members/:empId # Remove team member
GET    /api/project-management/:id/tasks          # Get project tasks
POST   /api/project-management/:id/tasks          # Create task
```

#### Task Management

```http
GET    /api/project-management/tasks/:id          # Get task by ID
PUT    /api/project-management/tasks/:id          # Update task
DELETE /api/project-management/tasks/:id          # Delete task
POST   /api/project-management/tasks/:id/comments # Add comment
POST   /api/project-management/tasks/:id/time     # Log time entry
```


Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 📁 Project Structure

### Backend Structure

```
Backend/
├── prisma/
│   ├── migrations/              # Database migration files
│   │   └── YYYYMMDDHHMMSS_migration_name/
│   │       └── migration.sql
│   └── schema.prisma           # Database schema definition
├── src/
│   ├── config/                 # Configuration files
│   │   ├── database.ts         # Database connection
│   │   ├── email.ts            # Email configuration
│   │   └── swagger.ts          # API documentation config
│   ├── middlewares/            # Express middlewares
│   │   ├── auth.middleware.ts  # JWT authentication
│   │   ├── error.middleware.ts # Error handling
│   │   ├── validation.middleware.ts # Request validation
│   │   └── rbac.middleware.ts  # Role-based access control
│   ├── modules/
│   │   ├── controller/         # Request handlers
│   │   │   ├── auth/
│   │   │   │   └── auth.controller.ts
│   │   │   ├── attendance/
│   │   │   │   └── attendance.controller.ts
│   │   │   ├── leave/
│   │   │   │   └── leave.controller.ts
│   │   │   ├── project-management/
│   │   │   │   └── project-management.controller.ts
│   │   │   └── user/
│   │   │       └── user.controller.ts
│   │   ├── services/           # Business logic
│   │   │   ├── attendanceService.ts
│   │   │   ├── leaveService.ts
│   │   │   ├── leave-approval.service.ts
│   │   │   ├── leave-notification.service.ts
│   │   │   ├── projectService.ts
│   │   │   ├── emailService.ts
│   │   │   └── authService.ts
│   │   └── routes/             # API routes
│   │       ├── auth/
│   │       │   └── auth.routes.ts
│   │       ├── attendance/
│   │       │   └── attendance.routes.ts
│   │       ├── leave/
│   │       │   └── leave.routes.ts
│   │       ├── project-management/
│   │       │   └── project-management.routes.ts
│   │       └── user/
│   │           └── user.routes.ts
│   ├── utils/                  # Utility functions
│   │   ├── validators.ts       # Zod schemas
│   │   ├── helpers.ts          # Helper functions
│   │   └── constants.ts        # Constants
│   ├── types/                  # TypeScript types
│   │   ├── express.d.ts        # Express type extensions
│   │   └── index.ts            # Shared types
│   ├── cron/                   # Scheduled jobs
│   │   └── attendance-cron.ts  # Auto checkout job
│   └── server.ts               # Application entry point
├── logs/                       # Application logs
├── .env                        # Environment variables
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Backend documentation
```

### Frontend Structure

```
Frontend/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── admin/                  # Admin dashboard
│   │   ├── _components/        # Admin-specific components
│   │   │   ├── Sidebar_A.tsx
│   │   │   └── AdminAttendanceContent.tsx
│   │   ├── attendance/
│   │   │   └── page.tsx
│   │   ├── leave-management/
│   │   │   └── page.tsx
│   │   ├── leave-approvals/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx            # Admin dashboard
│   ├── manager/                # Manager dashboard
│   │   ├── _components/
│   │   │   └── sidebar_m.tsx
│   │   ├── attendance/
│   │   │   └── page.tsx
│   │   ├── leave-management/
│   │   │   └── page.tsx
│   │   ├── team/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx            # Manager dashboard
│   ├── user/                   # Employee dashboard
│   │   ├── _components/
│   │   │   ├── sidebar_u.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── LeaveManagement.tsx
│   │   ├── attendance/
│   │   │   ├── component/      # Attendance components
│   │   │   │   ├── ActionsCard.tsx
│   │   │   │   ├── AttendanceStats.tsx
│   │   │   │   ├── TimingsCard.tsx
│   │   │   │   ├── AttendanceLog.tsx
│   │   │   │   └── LogsTabs.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAttendance.ts
│   │   │   ├── pages/
│   │   │   │   └── AttendancePage.tsx
│   │   │   └── page.tsx
│   │   ├── leave-management/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   └── page.tsx
│   │   ├── tasks/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx            # Employee dashboard
│   ├── superAdmin/             # Super Admin dashboard
│   │   ├── _components/
│   │   │   └── LeaveManagement.tsx
│   │   ├── leave-approvals/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── enhanced-tms/           # Enhanced TMS features
│   │   └── calendar/
│   │       └── page.tsx
│   ├── services/               # API services
│   │   ├── authService.ts
│   │   ├── attendanceService.ts
│   │   ├── leave.service.ts
│   │   ├── projectService.ts
│   │   └── calendarService.ts
│   ├── hooks/                  # Custom React hooks
│   │   └── useToast.ts
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                 # Shared components
│   ├── ui/                     # UI components (Radix UI)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── calendar/               # Calendar components
│   │   ├── AddEventModal.tsx
│   │   └── EventDetailsModal.tsx
│   ├── leave/                  # Leave components
│   │   └── LeaveApprovalPage.tsx
│   └── projects/               # Project components
│       └── CreateProjectModal.tsx
├── lib/                        # Utility libraries
│   ├── auth/                   # Authentication utilities
│   │   ├── AuthGuard.tsx
│   │   ├── useAuthGuard.ts
│   │   └── authUtils.ts
│   └── utils.ts                # Helper functions
├── public/                     # Static assets
│   ├── images/
│   └── icons/
├── styles/                     # Global styles
│   └── globals.css
├── .env.local                  # Environment variables
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
└── README.md                   # Frontend documentation
```



## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test

```


## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

### Pull Request Guidelines

- Describe your changes clearly
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed
- Link related issues

---


## 👥 Team

Anshita
Deepak Singla 

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Recharts](https://recharts.org/) - Chart library

---

## 📊 Project Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

---

**Made with ❤️ by the Team PRIMA**
=======
# prima
This is an hrms project
>>>>>>> 350dd7860dd010a7de9cc84ace5192419f4984c8
