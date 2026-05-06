# Employee1 Login Guide

## ✅ Data Successfully Seeded!

All dashboard data has been created for **employee1@mailinator.com**

---

## 🔑 How to Login

### Step 1: Reset Password

Since passwords are hashed, you need to reset it first:

1. **Go to Forgot Password:**
   ```
   http://localhost:3000/Forget_pass
   ```

2. **Enter Email:**
   ```
   employee1@mailinator.com
   ```

3. **Get OTP from Backend Console:**
   - Look at your backend terminal
   - Find the line: `🔐 Generated OTP for employee1@mailinator.com: 123456`
   - Copy the 6-digit OTP

4. **Enter OTP:**
   ```
   http://localhost:3000/otp_check
   ```
   - Paste the OTP
   - Click "Verify OTP"

5. **Set New Password:**
   ```
   http://localhost:3000/set_pass
   ```
   - Enter your new password
   - Confirm password
   - Click "Reset Password"

### Step 2: Login

1. **Go to Login Page:**
   ```
   http://localhost:3000/login
   ```

2. **Enter Credentials:**
   ```
   Email: employee1@mailinator.com
   Password: [your new password]
   ```

3. **Click Login**

---

## 📊 What You'll See on Dashboard

### Overview Cards:
- **My Tasks:** 10 tasks (3 in progress)
- **Completed:** 2 tasks
- **Completion Rate:** ~20%
- **Hours This Week:** ~40 hours

### Weekly Attendance Chart:
- Last 7 days attendance
- Work hours per day
- Mostly present with good attendance

### Task Distribution:
- TODO: 4 tasks (40%)
- IN_PROGRESS: 3 tasks (30%)
- IN_REVIEW: 1 task (10%)
- COMPLETED: 2 tasks (20%)

### Monthly Progress:
- Tasks completed over time
- Productivity trends

### Upcoming Events:
- Team Standup - Today at 9:30 AM
- Sprint Planning - Tomorrow
- Code Review - In 2 days
- Client Demo - In 3 days

---

## 📁 Available Data

### ✅ Attendance (22 records)
- Last 30 working days
- Realistic patterns (present, late, half-day, leave)

### ✅ Leave Records (4 records)
- 2 Approved (Casual, Sick)
- 2 Pending (WFH, Annual)

### ✅ Projects (3 projects)
1. E-Commerce Platform Redesign (45% complete)
2. Mobile App Development (30% complete)
3. API Integration Project (10% complete)

### ✅ Tasks (10 tasks)
- Various statuses and priorities
- Time tracking enabled
- Comments added

### ✅ Calendar Events (6 events)
- Meetings, training, deadlines
- Recurring daily standup

---

## 🔄 Re-seed Data

If you want to reset the data:

```bash
cd Backend
npx ts-node seed-employee1-dashboard.ts
```

This will:
- Clean existing data
- Create fresh mock data
- Generate unique project codes

---

## 🎯 Quick Test Flow

1. **Start Backend:**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Reset Password:**
   - Go to: http://localhost:3000/Forget_pass
   - Enter: employee1@mailinator.com
   - Check backend console for OTP
   - Set new password

4. **Login:**
   - Go to: http://localhost:3000/login
   - Use employee1@mailinator.com
   - Enter your new password

5. **View Dashboard:**
   - You'll be redirected to employee dashboard
   - All widgets will show the seeded data!

---

## 📱 Dashboard Sections to Explore

### MY WORK:
- **Tasks:** View all 10 tasks
- **Projects:** See 3 active projects
- **Calendar:** Check upcoming events

### TIME:
- **Attendance:** View last 30 days
- **Leave:** See approved and pending leaves

### Dashboard:
- **Overview:** Task statistics
- **Charts:** Attendance, task distribution, productivity
- **Quick Actions:** Create task, request leave

---

## 🎨 Sample Data Highlights

### High Priority Tasks:
- Implement Product Listing Page (Due in 3 days)
- User Authentication Flow (In Review)
- Payment Gateway Setup (Urgent)

### Upcoming Deadlines:
- Project Deadline in 10 days
- Multiple tasks due this week

### Recent Activity:
- 5 task comments
- Multiple time entries logged
- Consistent 8-hour workdays

---

## 💡 Tips

1. **OTP Location:** Always check backend console for OTP
2. **Password:** Set something simple for testing (e.g., "Test@123")
3. **Re-seed:** Run seed script anytime to refresh data
4. **Explore:** Click through all dashboard sections

---

## 🎉 You're All Set!

Login as employee1 and explore the fully populated dashboard with realistic mock data!

**Email:** employee1@mailinator.com  
**Dashboard:** http://localhost:3000/user/dashboard (after login)
