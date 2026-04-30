interface InviteEmployeeTemplateArgs {
  firstName: string;
  email: string;
  tempPassword: string;
}

export function inviteEmployeeTemplate({
  firstName,
  email,
  tempPassword,
}: InviteEmployeeTemplateArgs): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Hello ${firstName} </h2>

      <p>You have been invited to join our platform.</p>

      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>

      <p>Please verify your email by clicking the button below:</p>

      <p style="margin-top: 20px; font-size: 14px; color: #555;">
        This link will expire in 1 hour.
      </p>

      <p>
        If you did not request this invitation, please ignore this email.
      </p>

      <p>Thanks,<br/>Team PRIMA</p>
    </div>
  `;
}
