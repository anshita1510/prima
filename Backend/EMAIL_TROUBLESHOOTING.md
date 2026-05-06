# Email/OTP Troubleshooting Guide

## Issue: Not Receiving OTP Emails

### Changes Made:
1. ✅ Added TLS configuration to email transporter
2. ✅ Improved error handling and logging
3. ✅ Extended timeout values for better reliability
4. ✅ Added detailed console logging for debugging

### Common Issues & Solutions:

#### 1. Gmail App Password Issues
**Problem:** Gmail blocks "less secure apps" by default.

**Solution:**
- You're using an App Password (`ohkn jcma uchm zbkb`) which is correct
- Verify the App Password is still valid in your Google Account settings
- Go to: https://myaccount.google.com/apppasswords
- If expired, generate a new one and update `.env` file

#### 2. Email Going to Spam/Junk
**Check:**
- Look in your spam/junk folder
- Mark emails from `anshita.bharwal@signitysolutions.com` as "Not Spam"

#### 3. SMTP Connection Issues
**Verify:**
- Port 587 is not blocked by firewall
- Internet connection is stable
- Gmail SMTP is accessible from your network

#### 4. Environment Variables Not Loaded
**Check:**
```bash
# In Backend directory, verify .env is loaded
cat .env | grep SMTP
```

### Testing Steps:

#### Step 1: Test Email Configuration
```bash
cd Backend
npm run dev
# In another terminal:
npx ts-node test-email.ts
```

This will:
- Show all SMTP environment variables
- Attempt to send a test email
- Display detailed error messages if it fails

#### Step 2: Test Forgot Password Flow
```bash
# Start the backend server
cd Backend
npm run dev

# In another terminal, test the API:
curl -X POST http://localhost:5004/api/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@prima.com"}'
```

#### Step 3: Check Server Logs
Look for these log messages:
- `📧 Attempting to send email to: [email]`
- `✅ Email sent successfully: [messageId]`
- `❌ Email send failed: [error]`

### Quick Fixes:

#### Fix 1: Restart Backend Server
```bash
cd Backend
# Stop the server (Ctrl+C)
npm run dev
```

#### Fix 2: Verify Email Exists in Database
```bash
cd Backend
npx prisma studio
# Check Users table for the email you're testing
```

#### Fix 3: Generate New App Password
1. Go to Google Account → Security → 2-Step Verification → App passwords
2. Generate new password for "Mail"
3. Update `Backend/.env`:
   ```
   SMTP_PASS=your_new_app_password_here
   ```
4. Restart backend server

### Alternative: Use Different Email Service

If Gmail continues to have issues, consider using:

#### Option 1: SendGrid (Recommended for Production)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

#### Option 2: Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASS=your_mailgun_password
```

### Debug Checklist:
- [ ] Backend server is running
- [ ] `.env` file exists and has SMTP credentials
- [ ] Email address exists in database
- [ ] Check spam/junk folder
- [ ] Run test-email.ts script
- [ ] Check server console for error messages
- [ ] Verify Gmail App Password is valid
- [ ] Try with a different email address

### Still Not Working?

1. Check the backend console output when requesting OTP
2. Look for specific error messages
3. Verify the email address is correct
4. Try sending to a different email provider (not Gmail)
5. Check if your IP is blocked by Gmail (rare but possible)

### Contact Information:
If issues persist, check:
- Server logs in Backend console
- Network connectivity
- Gmail account security settings
