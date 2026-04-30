#!/bin/bash

# Script to create an admin user via API
# Usage: ./create-admin.sh

echo "🔐 PRIMA Clone - Create Admin User"
echo "=================================="
echo ""

# Configuration
API_URL="http://localhost:5004"
SUPER_ADMIN_EMAIL="singladeepak519@gmail.com"
SUPER_ADMIN_PASSWORD="password123"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Login as Super Admin
echo "📝 Step 1: Logging in as Super Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${SUPER_ADMIN_EMAIL}\",
    \"password\": \"${SUPER_ADMIN_PASSWORD}\"
  }")

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed! Check your credentials.${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Login successful!${NC}"
echo ""

# Step 2: Get admin details from user
echo "📋 Step 2: Enter new admin details"
echo "-----------------------------------"

read -p "Email: " ADMIN_EMAIL
read -p "First Name: " FIRST_NAME
read -p "Last Name: " LAST_NAME
read -p "Phone: " PHONE
read -p "Designation (e.g., MANAGER, HR_MANAGER): " DESIGNATION

echo ""
echo "📤 Step 3: Creating admin user..."

# Step 3: Create admin user
CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/api/users/register" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"firstName\": \"${FIRST_NAME}\",
    \"lastName\": \"${LAST_NAME}\",
    \"role\": \"ADMIN\",
    \"phone\": \"${PHONE}\",
    \"designation\": \"${DESIGNATION}\"
  }")

# Check if successful
if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Admin user created successfully!${NC}"
    echo ""
    echo "📧 Details:"
    echo "   Email: ${ADMIN_EMAIL}"
    echo "   Name: ${FIRST_NAME} ${LAST_NAME}"
    echo "   Role: ADMIN"
    echo "   Phone: ${PHONE}"
    echo "   Designation: ${DESIGNATION}"
    echo ""
    echo -e "${YELLOW}📬 An invitation email has been sent to ${ADMIN_EMAIL}${NC}"
    echo "   (If email is not configured, check backend logs for temporary password)"
else
    echo -e "${RED}❌ Failed to create admin user${NC}"
    echo "Response: $CREATE_RESPONSE"
    exit 1
fi

echo ""
echo "🎉 Done!"
