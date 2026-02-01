import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function verifyUser(allowedRoles?: string | string[]) {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {


      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ code: "TOKEN_MISSING" });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.ACCESS_SECRET!) as any;

      req.user = decoded;

      // ✅ Role check (optional)
      if (allowedRoles) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(req.user.role)) {
          return res.status(403).json({
            code: "FORBIDDEN",
            message: "Access denied for this role",
          });
        }
      }

      next();
    } catch (error: any) {
      console.log(error)
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ code: "TOKEN_EXPIRED" });
      }

      return res.status(401).json({ code: "TOKEN_INVALID" });
    }
  };
}
