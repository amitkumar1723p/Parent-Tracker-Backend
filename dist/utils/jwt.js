import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET;
export function verifyToken(token) {
    return jwt.verify(token, SECRET);
}
// // utils/jwt.ts
// import jwt from "jsonwebtoken";
export const signAccessToken = (user) => jwt.sign({
    _id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
}, process.env.ACCESS_SECRET, {
    expiresIn: "7d",
});
export const signRefreshToken = (user) => jwt.sign({
    _id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
}, process.env.REFRESH_SECRET, {
    expiresIn: "30d",
});
