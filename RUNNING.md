# SME-Accounts - Quick Start Guide

## ✅ Servers are Running!

### Access the Application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3002
- **Health Check**: http://localhost:3002/health

## Current Status

✅ Backend server is running on port 3002
✅ Frontend server is running on port 5173
✅ Environment variables are properly loaded
⚠️  Supabase connection has DNS issues (server continues in dev mode)

## Server Management

### View Logs:
```bash
# Backend logs
tail -f /tmp/sme-backend.log

# Frontend logs
tail -f /tmp/sme-frontend.log
```

### Stop Servers:
```bash
kill $(cat /tmp/backend.pid) $(cat /tmp/frontend.pid)
```

### Restart Servers:
```bash
./start.sh
```

## Supabase Connection Issue

The backend is showing a DNS error for Supabase:
```
getaddrinfo ENOTFOUND ewneacaxsuptwhhmhblwz.supabase.co
```

This could mean:
1. Network/DNS issue on your machine
2. The Supabase project might be paused or deleted
3. Firewall blocking the connection

The server continues to run in development mode, but database features won't work until Supabase is accessible.

### To Fix Supabase Connection:

1. **Check if the project exists**: Visit https://app.supabase.com and verify the project is active

2. **Test DNS resolution**:
   ```bash
   ping ewneacaxsuptwhhmhblwz.supabase.co
   ```

3. **Check network connectivity**:
   ```bash
   curl https://ewneacaxsuptwhhmhblwz.supabase.co
   ```

4. **If project doesn't exist**, create a new one and update `.env` files in both `backend/` and `frontend/`

## Available API Endpoints

- `GET /health` - Health check
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /invoices` - List invoices (requires auth)
- `POST /invoices` - Create invoice (requires auth)
- `GET /expenses` - List expenses (requires auth)
- `POST /expenses` - Create expense (requires auth)
- `GET /reports/profit` - Profit report (requires auth)
- `GET /reports/vat-summary` - VAT summary (requires auth)

## Next Steps

1. Open http://localhost:5173 in your browser
2. The frontend should load and display the application
3. Try the authentication flow (signup/login)
4. Note: Database operations will fail until Supabase connection is fixed

## Troubleshooting

### Port Already in Use:
```bash
# Kill processes on port 3002 (backend)
lsof -ti:3002 | xargs kill -9

# Kill processes on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Environment Variables Not Loading:
- Check that `.env` files exist in `backend/` and `frontend/`
- Restart the servers after changing `.env` files

---

**Built with**: Express.js + TypeScript + React + Vite + Supabase
