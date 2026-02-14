"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = verifyUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyUser(allowedRoles) {
    return (req, res, next) => {
        try {
            console.log('verify User running...........');
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith("Bearer ")) {
                return res.status(401).json({ code: "TOKEN_MISSING" });
            }
            const token = authHeader.split(" ")[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_SECRET);
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
        }
        catch (error) {
            console.log(error);
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ code: "TOKEN_EXPIRED" });
            }
            return res.status(401).json({ code: "TOKEN_INVALID" });
        }
    };
}
