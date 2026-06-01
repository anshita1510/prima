"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteAuthMiddleware = void 0;
const user_repository_1 = require("../modules/repository/auth/user.repository");
const db_1 = require("../config/db");
const userRepo = new user_repository_1.UserRepository();
const inviteAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Invite token missing" });
    }
    const token = authHeader.split(" ")[1];
    try {
        // Find User directly by inviteToken
        const user = await db_1.prisma.user.findUnique({
            where: { inviteToken: token },
        });
        if (!user || !user.inviteExpiry || user.inviteExpiry < new Date()) {
            return res.status(401).json({ error: "Invalid or expired invite token aggaga" });
        }
        // Attach the invited user to request
        req.invitedUser = user;
        next();
    }
    catch (err) {
        console.error("Invite auth error:", err);
        return res.status(401).json({ error: "Invalid invite token" });
    }
};
exports.inviteAuthMiddleware = inviteAuthMiddleware;
