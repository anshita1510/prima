"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_controller_1 = require("../../controller/email/email.controller");
const router = (0, express_1.Router)();
router.post("/send", email_controller_1.sendEmailController);
exports.default = router;
