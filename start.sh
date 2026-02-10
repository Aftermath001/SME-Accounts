#!/bin/bash

cd /home/alvin/Development/Projects/SME-Accounts

echo "Starting Backend Server..."
cd backend
npm run dev > /tmp/sme-backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > /tmp/backend.pid
echo "Backend started (PID: $BACKEND_PID)"

sleep 3

echo "Starting Frontend Server..."
cd ../frontend
npm run dev > /tmp/sme-frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > /tmp/frontend.pid
echo "Frontend started (PID: $FRONTEND_PID)"

sleep 3

echo ""
echo "========================================="
echo "✓ Servers are running!"
echo "========================================="
echo "Backend:  http://localhost:3002"
echo "Frontend: http://localhost:5173"
echo "========================================="
echo ""
echo "Logs:"
echo "  Backend:  tail -f /tmp/sme-backend.log"
echo "  Frontend: tail -f /tmp/sme-frontend.log"
echo ""
echo "To stop:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
