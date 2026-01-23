# SME-Accounts Backend

Production-ready Express.js + TypeScript backend for SME-Accounts MVP.

## Architecture

```
src/
├── config/          # Configuration management
├── controllers/     # HTTP request handlers
├── middleware/      # Express middleware (auth, validation, error handling)
├── routes/          # Route definitions
├── services/        # Business logic layer
├── types/           # TypeScript type definitions
├── utils/           # Utility functions (logger, response formatting, etc.)
└── server.ts        # Express app setup and startup
```

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
nano .env
```

### Environment Variables

Required:
- `SUPABASE_URL` – Your Supabase project URL
- `SUPABASE_ANON_KEY` – Supabase anonymous API key
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key (for admin operations)

Optional:
- `SERVER_PORT` – Default: 3000
- `SERVER_HOST` – Default: localhost
- `CORS_ORIGIN` – Default: http://localhost:5173
- `NODE_ENV` – Default: development
- `LOG_LEVEL` – Default: info

### Supabase Setup

1. **Create a Supabase project** at https://app.supabase.com
   - Click "New Project"
   - Choose a name and region (preferably closest to your users)
   - Create a strong database password

2. **Get your API credentials**
   - Go to **Settings → API** in your Supabase dashboard
   - Copy **Project URL** (looks like: `https://xxxx.supabase.co`)
   - Copy **service_role** key (⚠️ This is secret, never expose to frontend)

3. **Add credentials to `.env`**
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

4. **Verify connection**
   ```bash
   npm run dev
   ```
   - You should see: `✓ Supabase connection validated successfully`
   - If connection fails, check your credentials in `.env`

## Development

```bash
# Start development server (with hot reload)
npm run dev

# Type check
npm run type-check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints (STEP 1)

### Public Endpoints
- `GET /health` – Health check for monitoring

### Protected Endpoints
To be added in STEP 3 (Authentication).

## Project Status

**Phase:** STEP 1 - Backend Project Scaffold (COMPLETE)

Next Steps:
- STEP 2: Supabase Integration
- STEP 3: Authentication & Tenancy
- STEP 4: Core Domain Models
- STEP 5: Invoicing API
- STEP 6: Expenses API
- STEP 7: Reports & VAT Logic

## Code Standards

- **Language:** TypeScript (strict mode)
- **Formatter:** Prettier
- **Linter:** ESLint with TypeScript support
- **Architecture:** Clean separation of concerns (Controllers → Services → Data)
- **Error Handling:** Consistent error response format
- **Logging:** Structured logging via Logger utility

## Deployment

This project is Docker-ready:

```bash
docker build -t sme-accounts-backend .
docker run -p 3000:3000 --env-file .env sme-accounts-backend
```

See Dockerfile for details.

---

**Built with:** Express.js + TypeScript + Supabase  
**Target Platform:** Kenya (KRA Compliance)
