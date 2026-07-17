/**
 * Authentication middleware — JWT verification.
 *
 * Extracts and verifies a Bearer token from the Authorization header.
 * On success, attaches `userId` and `userEmail` to `req` (via res.locals).
 * On failure, returns 401.
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rmr-dev-secret';

export interface AuthPayload {
  userId: number;
  email: string;
}

/**
 * Express middleware: verifies JWT Bearer token.
 * Sets res.locals.auth with { userId, email } on success.
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    res.status(401).json({ error: 'Token de autenticación requerido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    res.locals.auth = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
