#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SME-Accounts Development Server     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"

# Cleanup function
cleanup() {
    echo -e "\n${RED}Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Start Backend
echo -e "\n${YELLOW}[Backend]${NC} Starting on port 3002..."
cd backend && npm run dev 2>&1 | sed "s/^/[BACKEND] /" &
BACKEND_PID=$!

sleep 3

# Start Frontend  
echo -e "${YELLOW}[Frontend]${NC} Starting on port 5173..."
cd ../frontend && npm run dev 2>&1 | sed "s/^/[FRONTEND] /" &
FRONTEND_PID=$!

sleep 3

echo -e "\n${GREEN}✓ Servers Started!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Backend:${NC}  http://localhost:3002/health"
echo -e "${GREEN}Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\nPress ${RED}Ctrl+C${NC} to stop\n"

wait
