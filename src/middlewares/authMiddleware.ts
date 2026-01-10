import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export function verifyUser(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader, "authHeader")
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        code: "TOKEN_MISSING",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_SECRET!
    ) as any;

    req.user = decoded;
    next();
  } catch (error: any) {
    // 👇 VERY IMPORTANT
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        code: "TOKEN_EXPIRED", // 🔥 frontend refresh karega
      });
    }

    return res.status(401).json({
      code: "TOKEN_INVALID", // 🔥 frontend logout karega
    });
  }
}

