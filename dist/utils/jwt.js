"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signRefreshToken = exports.signAccessToken = void 0;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET;
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, SECRET);
}
// // utils/jwt.ts
// import jwt from "jsonwebtoken";
const signAccessToken = (user) => jsonwebtoken_1.default.sign({
    _id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
}, process.env.ACCESS_SECRET, {
    expiresIn: "7d",
});
exports.signAccessToken = signAccessToken;
const signRefreshToken = (user) => jsonwebtoken_1.default.sign({
    _id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
}, process.env.REFRESH_SECRET, {
    expiresIn: "30d",
});
exports.signRefreshToken = signRefreshToken;
