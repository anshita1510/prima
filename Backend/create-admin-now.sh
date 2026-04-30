#!/bin/bash

echo "🔐 Creating Admin and Showing Credentials..."
echo "============================================"
echo ""

# Login
TOKEN=$(curl -s -X POST http://localhost:5004/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"singladeepak519@gmail.com","password":"password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "✅ Logged in as Super Admin"
echo ""

# Create admin with timestamp
EMAIL="admin_$(date +%s)@mailinator.com"
echo "📧 Creating admin: $EMAIL"
echo ""

curl -X POST http://localhost:5004/api/users/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"email\":\"$EMAIL\",\"firstName\":\"Test\",\"lastName\":\"Admin\",\"phone\":\"+9876543210\",\"designation\":\"Administrator\",\"role\":\"ADMIN\"}"

echo ""
echo ""
echo "============================================"
echo "✅ Admin Created!"
echo "📧 Email: $EMAIL"
echo ""
echo "🔍 CHECK BACKEND TERMINAL FOR:"
echo "   🔐 GENERATED CREDENTIALS FOR: $EMAIL"
echo "   OTP: [6-digit number]"
echo "   Temp Password: [12-character hex]"
echo "============================================"
