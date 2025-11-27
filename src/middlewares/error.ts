import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ status: false, message: 'Route not found' });
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
    .json({ status: false, message: err.message || 'Server error' });
}
