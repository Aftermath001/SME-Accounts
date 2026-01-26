import { Request, NextFunction } from 'express';

// Capture raw body string for routes that need to validate exact payload (e.g., webhooks)
export function rawBodyMiddleware(req: Request, _res: any, next: NextFunction): void {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    data += chunk;
  });
  req.on('end', () => {
    (req as any).rawBody = data;
    next();
  });
}

export default rawBodyMiddleware;
