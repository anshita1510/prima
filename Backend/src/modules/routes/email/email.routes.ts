import { Router } from "express";
import { sendEmailController } from "../../controller/email/email.controller";

const router = Router();

router.post("/send", sendEmailController);

export default router;