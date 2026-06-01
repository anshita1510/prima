"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDetailedAnalytics = exports.getAnalyticsData = void 0;
const db_1 = require("../../../config/db");
const client_1 = require("@prisma/client");
const getAnalyticsData = async (req, res) => {
    try {
        const user = req.user;
        const { period = 'monthly', offset = '0' } = req.query;
        const offsetNum = parseInt(offset) || 0;
        // Only SuperAdmin can access analytics
        if (user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. SuperAdmin access required.',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        console.log('🔍 Analytics - Getting data for period:', period, 'offset:', offsetNum);
        // Calculate date ranges based on period
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();
        function getMonday(d) {
            d = new Date(d);
            var day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(d.setDate(diff));
        }
        switch (period) {
            case 'weekly':
                const thisMonday = getMonday(now);
                thisMonday.setHours(0, 0, 0, 0);
                startDate = new Date(thisMonday.getTime() - (offsetNum * 7 * 24 * 60 * 60 * 1000));
                endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
                break;
            case 'yearly':
                startDate = new Date(now.getFullYear() - offsetNum, 0, 1);
                endDate = new Date(now.getFullYear() - offsetNum, 11, 31, 23, 59, 59, 999);
                break;
            case 'monthly':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth() - offsetNum, 1);
                endDate = new Date(now.getFullYear(), now.getMonth() - offsetNum + 1, 0, 23, 59, 59, 999);
                break;
        }
        // Leadership-only registrations (CEO / manager / HR / admin — no employees)
        const users = await db_1.prisma.user.findMany({
            where: {
                createdAt: { gte: startDate },
                role: { not: client_1.Role.EMPLOYEE },
            },
            select: {
                createdAt: true,
                role: true,
                designation: true,
                ceoId: true,
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        const userRegistrations = groupDataByPeriod(users, period, 'createdAt', startDate).map(item => ({
            period: item.periodLabel,
            total: item.data.length,
            ceos: item.data.filter((u) => u.ceoId).length,
            managers: item.data.filter((u) => u.role === client_1.Role.MANAGER).length,
            hr: item.data.filter((u) => typeof u.designation === 'string' &&
                u.designation.toLowerCase() === 'hr').length,
            otherAdmins: item.data.filter((u) => [client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN].includes(u.role) &&
                !u.ceoId &&
                !(typeof u.designation === 'string' && u.designation.toLowerCase() === 'hr')).length,
        }));
        // Get company registrations over time
        const companies = await db_1.prisma.company.findMany({
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            select: {
                createdAt: true,
                isActive: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        const companyRegistrations = groupDataByPeriod(companies, period, 'createdAt', startDate).map(item => ({
            period: item.periodLabel,
            total: item.data.length,
            active: item.data.filter((c) => c.isActive).length
        }));
        const [managers, ceos, totalHr, otherAdminLeaders, totalAdminsForTotals, totalCompaniesCount, leadershipUsers, activeLeadership,] = await Promise.all([
            db_1.prisma.user.count({ where: { role: client_1.Role.MANAGER } }),
            db_1.prisma.user.count({ where: { ceoId: { not: null } } }),
            db_1.prisma.user.count({
                where: {
                    role: { not: client_1.Role.EMPLOYEE },
                    designation: { equals: 'HR', mode: 'insensitive' },
                },
            }),
            db_1.prisma.user.count({
                where: {
                    role: { in: [client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN] },
                    ceoId: null,
                    NOT: { designation: { equals: 'HR', mode: 'insensitive' } },
                },
            }),
            db_1.prisma.user.count({ where: { role: { in: [client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN] } } }),
            db_1.prisma.company.count(),
            db_1.prisma.user.count({ where: { role: { not: client_1.Role.EMPLOYEE } } }),
            db_1.prisma.user.count({
                where: { isActive: true, role: { not: client_1.Role.EMPLOYEE } },
            }),
        ]);
        const roleDistribution = [
            { role: 'CEO accounts', count: ceos, color: '#F59E0B' },
            { role: 'Managers', count: managers, color: '#10B981' },
            { role: 'HR', count: totalHr, color: '#6366F1' },
            { role: 'Other admins', count: otherAdminLeaders, color: '#3B82F6' },
        ];
        // Get activity trends (using updatedAt as proxy for activity)
        const userActivity = await db_1.prisma.user.findMany({
            where: {
                updatedAt: {
                    gte: startDate,
                    lte: endDate
                },
                role: { not: client_1.Role.EMPLOYEE },
            },
            select: {
                updatedAt: true
            },
            orderBy: {
                updatedAt: 'asc'
            }
        });
        const activityTrends = groupDataByPeriod(userActivity, period, 'updatedAt', startDate).map(item => ({
            period: item.periodLabel,
            activity: item.data.length
        }));
        const currentTotals = {
            totalUsers: leadershipUsers,
            totalAdmins: totalAdminsForTotals,
            totalCeos: ceos,
            totalManagers: managers,
            totalHr,
            totalCompanies: totalCompaniesCount,
            activeUsers: activeLeadership,
        };
        return res.json({
            success: true,
            analytics: {
                period,
                dateRange: {
                    start: startDate.toISOString(),
                    end: now.toISOString()
                },
                userRegistrations,
                companyRegistrations,
                roleDistribution,
                activityTrends,
                currentTotals
            }
        });
    }
    catch (error) {
        console.error('Error fetching analytics data:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics data',
            error: error.message
        });
    }
};
exports.getAnalyticsData = getAnalyticsData;
const getDetailedAnalytics = async (req, res) => {
    try {
        const user = req.user;
        const { metric, period = 'monthly' } = req.query;
        if (user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. SuperAdmin access required.'
            });
        }
        let data;
        switch (metric) {
            case 'users':
                data = await db_1.prisma.user.findMany({
                    where: { role: { not: client_1.Role.EMPLOYEE } },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        status: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                        company: {
                            select: {
                                name: true,
                                code: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });
                break;
            case 'companies':
                data = await db_1.prisma.company.findMany({
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        isActive: true,
                        createdAt: true,
                        _count: {
                            select: {
                                users: true,
                                employees: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });
                break;
            case 'roles':
                data = await db_1.prisma.user.groupBy({
                    by: ['role'],
                    where: { role: { not: client_1.Role.EMPLOYEE } },
                    _count: {
                        role: true
                    },
                    orderBy: {
                        _count: {
                            role: 'desc'
                        }
                    }
                });
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid metric specified'
                });
        }
        return res.json({
            success: true,
            metric,
            period,
            data
        });
    }
    catch (error) {
        console.error('Error fetching detailed analytics:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch detailed analytics',
            error: error.message
        });
    }
};
exports.getDetailedAnalytics = getDetailedAnalytics;
// Helper function to strictly bucket data based on the requested period types
function groupDataByPeriod(data, period, dateField, startDate) {
    const buckets = [];
    if (period === 'weekly') {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach((d, i) => {
            const dateStr = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            buckets.push({ key: dateStr, label: d, data: [] });
        });
    }
    else if (period === 'monthly') {
        buckets.push({ key: 'W1', label: 'W1', data: [] });
        buckets.push({ key: 'W2', label: 'W2', data: [] });
        buckets.push({ key: 'W3', label: 'W3', data: [] });
        buckets.push({ key: 'W4', label: 'W4', data: [] });
    }
    else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach((m, i) => {
            buckets.push({ key: i.toString(), label: m, data: [] });
        });
    }
    data.forEach(item => {
        const date = new Date(item[dateField]);
        let targetKey;
        if (period === 'weekly') {
            targetKey = date.toISOString().split('T')[0];
        }
        else if (period === 'monthly') {
            const day = date.getDate();
            if (day <= 7)
                targetKey = 'W1';
            else if (day <= 14)
                targetKey = 'W2';
            else if (day <= 21)
                targetKey = 'W3';
            else
                targetKey = 'W4';
        }
        else {
            targetKey = date.getMonth().toString();
        }
        const bucket = buckets.find(b => b.key === targetKey);
        if (bucket) {
            bucket.data.push(item);
        }
    });
    return buckets.map(b => ({
        period: b.key,
        periodLabel: b.label,
        data: b.data
    }));
}
