"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const passport_1 = __importDefault(require("./config/passport")); // Import passport config
const auth_routes_1 = __importDefault(require("./modules/routes/auth/auth.routes"));
const passport_google_routes_1 = __importDefault(require("./modules/routes/auth/passport-google.routes")); // New Passport routes
const github_oauth_routes_1 = __importDefault(require("./modules/routes/auth/github-oauth.routes"));
const leave_routes_1 = __importDefault(require("./modules/routes/leave/leave.routes"));
const attendance_routes_1 = __importDefault(require("./modules/routes/attendance/attendance.routes")); // New attendance routes with my-logs endpoint
const project_routes_1 = __importDefault(require("./modules/routes/project.routes"));
const task_routes_1 = __importDefault(require("./modules/routes/task.routes"));
const notification_routes_1 = __importDefault(require("./modules/routes/notification.routes"));
const project_routes_2 = __importDefault(require("./modules/routes/project/project.routes"));
const employee_routes_1 = __importDefault(require("./modules/routes/employee.routes"));
const calendar_routes_1 = __importDefault(require("./modules/routes/calendar.routes"));
const company_routes_1 = __importDefault(require("./modules/routes/company.routes"));
const ceo_routes_1 = __importDefault(require("./modules/routes/ceo.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/routes/dashboard.routes"));
const analytics_routes_1 = __importDefault(require("./modules/routes/analytics.routes"));
const validation_middleware_1 = require("./middlewares/validation.middleware");
const autoCheckout_cron_1 = require("./cron/autoCheckout.cron");
const swagger_1 = require("./config/swagger");
dotenv_1.default.config();
const app = (0, express_1.default)();
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
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'https://prima-ashen.vercel.app'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie', 'Authorization'],
    optionsSuccessStatus: 200,
    maxAge: 3600
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Initialize Passport
app.use(passport_1.default.initialize());
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
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PRIMA Clone API Documentation'
}));
// Routes
app.use('/api/users', auth_routes_1.default);
app.use('/api/auth', passport_google_routes_1.default); // Use Passport routes
app.use('/api/auth', github_oauth_routes_1.default); // GitHub OAuth routes
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
app.use('/api/leaves', leave_routes_1.default);
app.use('/api/attendance', attendance_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/employees', employee_routes_1.default);
app.use('/api/companies', company_routes_1.default);
app.use('/api/ceos', ceo_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
app.get('/api/debug/departments', async (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const departments = await prisma.department.findMany();
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});
// New Project Management Routes
app.use('/api/project-management', project_routes_2.default);
// Calendar Routes
app.use('/api/calendar', calendar_routes_1.default);
// Error handling middleware
app.use(validation_middleware_1.errorHandler);
// Initialize cron jobs
(0, autoCheckout_cron_1.scheduleAutoCheckout)();
// Start server
app.listen(5004, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port 5004`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
// Trigger nodemon restart
