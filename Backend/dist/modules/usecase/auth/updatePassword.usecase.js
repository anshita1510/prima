"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePasswordUsecase = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class UpdatePasswordUsecase {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async execute(userId, newPassword) {
        if (!newPassword || newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // This method now exists!
        await this.userRepo.updatePassword(userId, hashedPassword);
        // NEVER log raw passwords in production!
        // console.log("New password: ", newPassword);  // Remove this line
        return { message: 'Password updated successfully' };
    }
}
exports.UpdatePasswordUsecase = UpdatePasswordUsecase;
