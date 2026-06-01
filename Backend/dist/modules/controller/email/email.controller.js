"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailController = void 0;
const sendEmail_1 = require("../../../shared/utils/sendEmail");
const sendEmailController = async (req, res) => {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) {
        return res.status(400).json({ message: "Missing fields" });
    }
    await (0, sendEmail_1.sendEmail)(to, subject, message);
    return res.json({ message: "Email sent successfully" });
};
exports.sendEmailController = sendEmailController;
