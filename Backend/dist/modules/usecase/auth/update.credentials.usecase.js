"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCredentialsUsecase = void 0;
class UpdateCredentialsUsecase {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(userId, data) {
        if (!userId) {
            throw new Error("Unauthorized have not id");
        }
        const user = await this.repo.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return this.repo.updateUser(userId, data);
    }
}
exports.UpdateCredentialsUsecase = UpdateCredentialsUsecase;
