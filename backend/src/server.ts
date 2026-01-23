import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import config from './config';
import { Logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './utils/error-handler';
import healthRouter from './routes/health';
import authRouter from './routes/auth.routes';
import invoiceRouter from './routes/invoice.routes';
import expenseRouter from './routes/expense.routes';
import { validateSupabaseConnection } from './config/supabase';

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging middleware
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
app.use((req: Request, _res: Response, next: NextFunction): void => {
  const method = (req as any).method || 'UNKNOWN';
  const path = (req as any).path || (req as any).url || '/';
  Logger.debug(`${method} ${path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check (public, no auth required)
app.use(healthRouter);

// Auth routes (public, no auth required)
// POST /auth/signup, POST /auth/login
app.use('/auth', authRouter);

// Invoice routes (protected, requires auth + tenant context)
// POST /invoices, GET /invoices, GET /invoices/:id, etc.
app.use('/invoices', invoiceRouter);

// Expense routes (protected, requires auth + tenant context)
// POST /expenses, GET /expenses, GET /expenses/:id, etc.
app.use('/expenses', expenseRouter);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler (must be last route handler)
app.use(notFoundHandler);

// Global error handler (must be last middleware)
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const start = async (): Promise<void> => {
  try {
    Logger.info('Starting SME-Accounts Backend', {
      environment: config.node_env,
      port: config.server.port,
    });

    // Validate Supabase connection before starting server
    const isSupabaseReady = await validateSupabaseConnection();
    if (!isSupabaseReady) {
      Logger.error('Failed to connect to Supabase. Check your credentials and try again.');
      process.exit(1);
    }

    app.listen(config.server.port, config.server.host, () => {
      Logger.info(`✓ Server running at http://${config.server.host}:${config.server.port}`, {
        healthCheck: `http://${config.server.host}:${config.server.port}/health`,
      });
    });
  } catch (error) {
    Logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
};

start();

export default app;
