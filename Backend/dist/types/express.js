"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthUser = isAuthUser;
/**
 * Type guard for safe runtime checking
 */
function isAuthUser(user) {
    return (user &&
        typeof user.id === 'number' &&
        typeof user.email === 'string' &&
        typeof user.role === 'string');
}
