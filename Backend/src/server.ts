import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import passport from './config/passport'; // Import passport config
import authRoutes from './modules/routes/auth/auth.routes';
import passportGoogleRoutes from './modules/routes/auth/passport-google.routes'; // New Passport routes
import githubAuthRoutes from './modules/routes/auth/github-oauth.routes';
import leaveRoutes from './modules/routes/leave/leave.routes';
import attendanceRoutes from './modules/routes/attendance/attendance.routes'; // New attendance routes with my-logs endpoint
import projectRoutes from './modules/routes/project.routes';
import taskRoutes from './modules/routes/task.routes';
import notificationRoutes from './modules/routes/notification.routes';
import newProjectRoutes from './modules/routes/project/project.routes';
import employeeRoutes from './modules/routes/employee.routes';
import calendarRoutes from './modules/routes/calendar.routes';
import companyRoutes from './modules/routes/company.routes';
import ceoRoutes from './modules/routes/ceo.routes';
import dashboardRoutes from './modules/routes/dashboard.routes';
import analyticsRoutes from './modules/routes/analytics.routes';
import { errorHandler } from './middlewares/validation.middleware';
import { scheduleAutoCheckout } from './cron/autoCheckout.cron';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;

// ✅ Request Logger with timing
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`➡️  ${req.method} ${req.url}`);
  res.on('finish', () => {
    console.log(`✅ ${req.method} ${req.url} → ${res.statusCode} [${Date.now() - start}ms]`);
  });
  res.on('close', () => {
    if (!res.writableEnded) {
      console.log(`⚠️  ${req.method} ${req.url} → CONNECTION CLOSED before response [${Date.now() - start}ms]`);
    }
  });
  next();
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Middleware - CORS configuration (must be before routes)
// app.use(cors({
//   origin: function (origin, callback) {
//     const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
//   exposedHeaders: ['Set-Cookie', 'Authorization'],
//   optionsSuccessStatus: 200,
//   maxAge: 3600
// }));
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];

    // Allow whitelisted origins or any other origin (no restriction)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 3600
}));



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check cookies
app.get('/debug/cookies', (req, res) => {
  res.json({
    cookies: req.cookies,
    headers: req.headers,
    authToken: req.cookies?.auth_token ? 'Present' : 'Missing'
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PRIMA Clone API Documentation'
}));

// Routes
app.use('/api/users', authRoutes);
app.use('/api/auth', passportGoogleRoutes); // Use Passport routes
app.use('/api/auth', githubAuthRoutes); // GitHub OAuth routes

// Test endpoint to verify OAuth routes are loaded
app.get('/api/auth/test', (req, res) => {
  res.json({
    message: 'OAuth routes are working with Passport!',
    availableRoutes: [
      'GET /api/auth/google',
      'GET /api/auth/google/callback',
      'GET /api/auth/github',
      'GET /api/auth/github/callback',
      'POST /api/auth/logout'
    ]
  });
});

app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/ceos', ceoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use('/api/notifications', notificationRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Debug routes to check data
app.get('/api/debug/employees', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const employees = await prisma.employee.findMany({
      include: { user: true, department: true }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.get('/api/debug/users', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isActive: true,
        password: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/debug/departments', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// New Project Management Routes
app.use('/api/project-management', newProjectRoutes);

// Calendar Routes
app.use('/api/calendar', calendarRoutes);

// Error handling middleware
app.use(errorHandler);

// Initialize cron jobs
scheduleAutoCheckout();

// Start server
app.listen(5004, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port 5004`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
// Trigger nodemon restart