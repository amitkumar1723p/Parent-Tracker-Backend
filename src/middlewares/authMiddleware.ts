import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export function verifyUser(req: Request & { user?: any }, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, SECRET) as any;
    console.log(decoded, "decoded")
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        status: false,
        message: "Invalid token",
      });
    }

    req.user = decoded; // store decoded user details in req.user
    next();
  } catch (error) {
    console.log("AUTH ERROR:", error);
    return res.status(401).json({
      status: false,
      message: "Unauthorized or token expired",
    });
  }
}
