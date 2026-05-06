# How to Find Your OTP

## Quick Checklist:

### ✅ Step 1: Check Backend Console
When you request an OTP, the backend console will print it:

```
🔍 Forgot password request for: your-email@example.com
✅ User found: John Doe (ADMIN)
🔐 Generated OTP for your-email@example.com: 123456  ← YOUR OTP IS HERE!
⏰ OTP expires in 5 minutes
📧 Attempting to send email to: your-email@example.com
✅ Email sent successfully: <message-id>
```

**Look for the line that says:** `🔐 Generated OTP for...`

---

### ✅ Step 2: Check Your Email Inbox

1. **Check Primary Inbox** - Look for email from `anshita.bharwal@signitysolutions.com`
2. **Subject:** "Reset Password OTP - PRIMA"

---

### ✅ Step 3: Check SPAM/JUNK Folder ⚠️

**This is the most common issue!**

Gmail often filters automated emails to spam, especially:
- First-time senders
- Automated emails
- Emails with OTP/codes

**How to check:**
1. Open Gmail
2. Click on "Spam" or "Junk" in the left sidebar
3. Search for "PRIMA" or "OTP"
4. If found, mark as "Not Spam"

---

### ✅ Step 4: Verify Email Address

Make sure you're checking the correct email address:

```bash
# Check which email you used
cd Backend
npx ts-node check-otp-in-db.ts your-email@example.com
```

This will show:
- If the user exists
- If OTP was generated
- When it expires

---

### ✅ Step 5: Debug Email Sending

Run the debug script:

```bash
cd Backend
npx ts-node debug-email-flow.ts your-email@example.com
```

This will:
- Check email configuration
- Send a test email
- Show detailed error messages if it fails

---

## Common Issues:

### Issue 1: "OTP sent successfully" but no email
**Cause:** Email is in spam folder  
**Solution:** Check spam/junk folder

### Issue 2: Backend console doesn't show OTP
**Cause:** Backend server not running or error occurred  
**Solution:** 
```bash
cd Backend
npm run dev
# Watch the console when requesting OTP
```

### Issue 3: Email address not found
**Cause:** Email not registered in database  
**Solution:** 
```bash
cd Backend
npx prisma studio
# Check Users table
```

### Issue 4: OTP expired
**Cause:** OTP is only valid for 5 minutes  
**Solution:** Request a new OTP

---

## Quick Commands:

### 1. Check if OTP exists in database:
```bash
cd Backend
npx ts-node check-otp-in-db.ts your-email@example.com
```

### 2. Test email configuration:
```bash
cd Backend
npx ts-node debug-email-flow.ts your-email@example.com
```

### 3. Request new OTP via API:
```bash
curl -X POST http://localhost:5004/api/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

---

## Where to Look:

### 1️⃣ Backend Console (Terminal)
```
🔐 Generated OTP for your-email@example.com: 123456
```
**This is the most reliable place to find your OTP!**

### 2️⃣ Email Inbox
- From: anshita.bharwal@signitysolutions.com
- Subject: Reset Password OTP - PRIMA

### 3️⃣ Spam/Junk Folder
- **Check here first if not in inbox!**

### 4️⃣ Database (if needed)
```bash
cd Backend
npx prisma studio
# Go to User table → Find your email → Check resetOtp field (it's hashed)
```

---

## Pro Tips:

1. **Always watch the backend console** when requesting OTP - it prints the OTP there!

2. **Check spam folder immediately** - Don't wait, Gmail filters quickly

3. **Request new OTP if expired** - They only last 5 minutes

4. **Use the same email** - Make sure you're checking the email you entered

5. **Whitelist the sender** - Add `anshita.bharwal@signitysolutions.com` to contacts

---

## Still Can't Find It?

### Option 1: Use Backend Console OTP
The OTP is printed in the backend console. Just copy it from there!

### Option 2: Check Database
```bash
cd Backend
npx ts-node check-otp-in-db.ts your-email@example.com
```

### Option 3: Request New OTP
Click "Resend OTP" on the verification page or go back to forgot password page.

---

## Example Flow:

1. **Request OTP** at `http://localhost:3000/Forget_pass`
2. **Watch Backend Console** - Copy the OTP from there
3. **Check Email** - Primary inbox first, then spam
4. **Enter OTP** at `http://localhost:3000/otp_check`
5. **Reset Password** at `http://localhost:3000/set_pass`

---

**Remember:** The OTP is ALWAYS printed in the backend console! That's your backup if email doesn't arrive.
