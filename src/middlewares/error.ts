import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ ok: false, message: 'Route not found' });
}

export function onError(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ ok: false, message: err.message || 'Server error' });
}
