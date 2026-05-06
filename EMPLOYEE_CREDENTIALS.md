# Employee Credentials Summary

## 📋 Total Users: 45

---

## 🔹 SUPER_ADMIN (3 users)

### 1. Super Admin
- **Email:** superadmin@mailinator.com.com
- **Role:** SUPER_ADMIN
- **Status:** ACTIVE ✅
- **Designation:** DIRECTOR
- **Phone:** +1234567890

### 2. Super Admin
- **Email:** superadmin@PRIMA.com
- **Role:** SUPER_ADMIN
- **Status:** ACTIVE ✅
- **Designation:** DIRECTOR
- **Phone:** +1234567890

### 3. Super Admin
- **Email:** superadmin@mailinator.com
- **Role:** SUPER_ADMIN
- **Status:** ACTIVE ✅
- **Designation:** DIRECTOR
- **Phone:** +1234567890
- **Employee Code:** EMP-0001
- **Department:** IT

---

## 🔹 ADMIN (24 users)

### 1. admin user
- **Email:** admin@mailinator.com
- **Role:** ADMIN
- **Status:** ACTIVE ✅
- **Designation:** ADMIN
- **Phone:** +1234567891
- **Employee Code:** EMP-0002
- **Department:** IT

### 2-24. CEO Users (ceo.acme, ceo.globex, ceo.tnt01-20, ceo.initech)
All CEO accounts follow this pattern:
- **Email:** ceo.{company}@mailinator.com
- **Role:** ADMIN
- **Status:** ACTIVE ✅
- **Designation:** CEO
- **Department:** Management (OPERATIONS)

---

## 🔹 EMPLOYEE (18 users)

### 1. Amit Verma
- **Email:** amit.verma@mailinator.com
- **Role:** EMPLOYEE
- **Designation:** DevOps Engineer
- **Employee Code:** EMP-AV01
- **Department:** IT

### 2. employee1 ji
- **Email:** employee1@mailinator.com
- **Role:** EMPLOYEE
- **Designation:** SOFTWARE_ENGINEER
- **Employee Code:** EMP0133
- **Department:** General (OPERATIONS)

### 3. employee2 ji
- **Email:** employee2@mailinator.com
- **Role:** EMPLOYEE
- **Designation:** Software Engineer
- **Employee Code:** EMP-E02JI
- **Department:** IT

### 4. Meenu Rani
- **Email:** meenu.rani@mailinator.com
- **Role:** EMPLOYEE
- **Designation:** UI/UX Designer
- **Employee Code:** EMP-MR01
- **Department:** IT

### 5. Mishri Rani
- **Email:** mishri.rani@mailinator.com
- **Role:** EMPLOYEE
- **Designation:** Developer
- **Employee Code:** EMP-MI01
- **Department:** IT

### 6. Pooja Singh
- **Email:** pooja.singh@mailinator.com
- **Role:** EMPLOYEE
- **Designation:** Backend Developer
- **Employee Code:** EMP-PS01
- **Department:** IT

### 7. Raju Kumar
- **Email:** raju.kumar@mailinator.com
- **Role:** EMPLOYEE
- **Designation:** UI/UX Designer
- **Employee Code:** EMP-RJ01
- **Department:** IT

### 8. Rakshi Kumari
- **Email:** rakshi.kumari@mailinator.com
- **Role:** EMPLOYEE
- **Designation:** Product Manager
- **Employee Code:** EMP-RS01
- **Department:** IT

### 9. Raman Kumar
- **Email:** raman.kumar@mailinator.com
- **Role:** EMPLOYEE
- **Designation:** QA Engineer
- **Employee Code:** EMP-RK01
- **Department:** IT

### 10. Varun Sharma
- **Email:** varun.sharma@mailinator.com
- **Role:** EMPLOYEE
- **Designation:** QA Engineer
- **Employee Code:** EMP-VS01
- **Department:** IT

---

## 🔑 How to Login

### Option 1: If You Know the Password
1. Go to: http://localhost:3000/login
2. Enter email from above
3. Enter password

### Option 2: Reset Password (Recommended)
1. Go to: http://localhost:3000/Forget_pass
2. Enter email address
3. **Check backend console for OTP** (it's printed there!)
4. Enter OTP at: http://localhost:3000/otp_check
5. Set new password at: http://localhost:3000/set_pass

---

## 📝 Important Notes

### Passwords
- ❌ Passwords are hashed and cannot be displayed
- ✅ Use "Forgot Password" to reset any password
- ✅ OTP will be shown in backend console when requested

### Quick Test Accounts

**Super Admin:**
```
Email: superadmin@mailinator.com
Use Forgot Password to reset
```

**Admin:**
```
Email: admin@mailinator.com
Use Forgot Password to reset
```

**Employee:**
```
Email: employee1@mailinator.com
Use Forgot Password to reset
```

---

## 🛠️ Commands

### Get All Credentials:
```bash
cd Backend
npx ts-node get-employee-credentials.ts
```

### Reset Password for Any User:
1. Start backend: `cd Backend && npm run dev`
2. Go to: http://localhost:3000/Forget_pass
3. Enter email
4. Check backend console for OTP
5. Enter OTP and set new password

---

## 🎯 Recommended Test Accounts

For testing different roles:

1. **Super Admin:** superadmin@mailinator.com
2. **Admin/CEO:** admin@mailinator.com
3. **Employee:** employee1@mailinator.com

All passwords can be reset using the Forgot Password flow!

---

**Last Updated:** Generated from database
**Total Active Users:** 45
