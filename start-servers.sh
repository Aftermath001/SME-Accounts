#!/bin/bash

cd /home/alvin/Development/Projects/SME-Accounts

# Start backend
cd backend
npm run dev &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "========================================="
echo "Backend:  http://localhost:3002"
echo "Frontend: http://localhost:5173"
echo "========================================="
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop servers, run:"
echo "kill $BACKEND_PID $FRONTEND_PID"

wait
