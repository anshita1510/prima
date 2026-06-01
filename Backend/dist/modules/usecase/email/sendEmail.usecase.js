"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailUseCase = void 0;
class SendEmailUseCase {
    constructor(emailService) {
        this.emailService = emailService;
    }
    async execute(data) {
        await this.emailService.sendEmail(data);
    }
}
exports.SendEmailUseCase = SendEmailUseCase;
