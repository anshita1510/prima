#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Creating Admin through Super Admin${NC}"
echo "============================================"
echo ""

# Login
echo -e "${YELLOW}1️⃣ Logging in as Super Admin...${NC}"
TOKEN=$(curl -s -X POST http://localhost:5004/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"singladeepak519@gmail.com","password":"password123"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo ""

# Create admin
EMAIL="deepak_admin_$(date +%s)@mailinator.com"
echo -e "${YELLOW}2️⃣ Creating admin: ${EMAIL}${NC}"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:5004/api/users/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"email\":\"$EMAIL\",\"firstName\":\"Deepak\",\"lastName\":\"Admin\",\"phone\":\"+9876543210\",\"designation\":\"Administrator\",\"role\":\"ADMIN\"}")

echo "$RESPONSE"
echo ""
echo "============================================"
echo -e "${GREEN}✅ Admin Created Successfully!${NC}"
echo -e "${BLUE}📧 Email: ${EMAIL}${NC}"
echo ""
echo -e "${YELLOW}🔍 BACKEND TERMINAL WILL SHOW:${NC}"
echo -e "   ${RED}🔐 GENERATED CREDENTIALS FOR: ${EMAIL}${NC}"
echo -e "   ${RED}   OTP: [6-digit number]${NC}"
echo -e "   ${RED}   Temp Password: [12-character hex]${NC}"
echo ""
echo -e "${YELLOW}📧 Email also sent to: ${EMAIL}${NC}"
echo -e "${YELLOW}   (Check spam folder if not in inbox)${NC}"
echo "============================================"
