"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
// ✅ .env file ko auto load karne ke liye (PORT, etc.)
require("dotenv/config");
// ✅ HTTP server create karne ke liye (Socket.io support)
const http_1 = __importDefault(require("http"));
// ✅ Express framework (API banane ke kaam)
const express_1 = __importDefault(require("express"));
// ✅ Security headers enable (XSS, Clickjacking protections)
const helmet_1 = __importDefault(require("helmet"));
// ✅ Console me request logs show karega
const morgan_1 = __importDefault(require("morgan"));
// ✅ Client se aayi cookies ko access karne ke liye
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// ✅ MongoDB database connect karne ke liye
const db_1 = require("./config/db");
// ✅ Environment variables ka central config
const env_1 = require("./config/env");
// ✅ Saare routes ka main entry point
const index_1 = __importDefault(require("./routes/index"));
// ✅ Custom error handling middleware (404 + server errors)
const error_1 = require("./middlewares/error");
// ✅ Socket.io (real-time functionalities) init karne ke liye
const index_2 = require("./socket/index");
const app = (0, express_1.default)();
/** ---------------------------------------
 * 🛡️ Security & Payload Parsing Middlewares
 ----------------------------------------*/
// "dev": "ts-node-dev --respawn --transpile-only --ignore-watch node_modules src/index.ts",
// ✅ Secure HTTP headers add karta hai
app.use((0, helmet_1.default)());
// ✅ Frontend apps ko is server se connect ki permission
// app.use(
//   cors({
//     // Multiple origins allow kar sakte ho (comma separated)
//     origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
//     credentials: true, // cookies ko allow karta hai
//   })
// );
// ✅ JSON body parsing (max 1MB)
app.use(express_1.default.json({ limit: "1mb" }));
// ✅ URL encoded form data support
app.use(express_1.default.urlencoded({ extended: true }));
// ✅ Cookies ko req.cookies me available karega
app.use((0, cookie_parser_1.default)());
// ✅ Request log for debugging
app.use((0, morgan_1.default)("dev"));
/** ---------------------------------------
 * 🔌 HTTP + Socket.io Server Start
 ----------------------------------------*/
// ✅ HTTP server create (Socket.io ke liye zaroori)
const server = http_1.default.createServer(app);
// ✅ Socket.io initialize
exports.io = (0, index_2.initSocket)(server);
/** ---------------------------------------
 * 🚀 API Routes
 ----------------------------------------*/
// ✅ All APIs → /api se start honge
app.use("/api", index_1.default);
/** ---------------------------------------
 * ✅ Health Check Route
 * (Server chal raha hai ya nahi)
 ----------------------------------------*/
app.get("/health", (_, res) => res.json({ status: true, message: "Helth is OK" }));
/** ---------------------------------------
 * ❌ 404 + 🛑 Error Handling
 ----------------------------------------*/
// ✅ Undefined routes handle karega
app.use(error_1.notFound);
// ✅ Server errors ko handle karega
app.use(error_1.onError);
// ✅ Server start + DB connection
server.listen(env_1.env.PORT, async () => {
    await (0, db_1.connectDB)();
    console.log(`✅ server up on http://localhost:${env_1.env.PORT}`);
});
