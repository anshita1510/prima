
import { SendEmailDTO } from "../../dto/email/sendEmail.dto";

export interface EmailService {
  sendEmail(data: SendEmailDTO): Promise<void>;
}
