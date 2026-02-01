// ✅ .env file ko auto load karne ke liye (PORT, etc.)
import "dotenv/config";

// ✅ HTTP server create karne ke liye (Socket.io support)
import http from "http";

// ✅ Express framework (API banane ke kaam)
import express from "express";

// ✅ Cross-origin requests allow karne ke liye
import cors from "cors";

// ✅ Security headers enable (XSS, Clickjacking protections)
import helmet from "helmet";

// ✅ Console me request logs show karega
import morgan from "morgan";

// ✅ Client se aayi cookies ko access karne ke liye
import cookieParser from "cookie-parser";

// ✅ MongoDB database connect karne ke liye
import { connectDB } from "./config/db";

// ✅ Environment variables ka central config
import { env } from "./config/env";

// ✅ Saare routes ka main entry point
import router from "./routes/index";

// ✅ Custom error handling middleware (404 + server errors)
import { notFound, onError } from "./middlewares/error";

// ✅ Socket.io (real-time functionalities) init karne ke liye
import { initSocket } from "./socket/index";

const app = express();

/** ---------------------------------------
 * 🛡️ Security & Payload Parsing Middlewares
 ----------------------------------------*/

// "dev": "ts-node-dev --respawn --transpile-only --ignore-watch node_modules src/index.ts",
// ✅ Secure HTTP headers add karta hai
app.use(helmet());

// ✅ Frontend apps ko is server se connect ki permission
// app.use(
//   cors({
//     // Multiple origins allow kar sakte ho (comma separated)
//     origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
//     credentials: true, // cookies ko allow karta hai
//   })
// );

// ✅ JSON body parsing (max 1MB)
app.use(express.json({ limit: "1mb" }));

// ✅ URL encoded form data support
app.use(express.urlencoded({ extended: true }));

// ✅ Cookies ko req.cookies me available karega
app.use(cookieParser());

// ✅ Request log for debugging
app.use(morgan("dev"));

/** ---------------------------------------
 * 🔌 HTTP + Socket.io Server Start
 ----------------------------------------*/

// ✅ HTTP server create (Socket.io ke liye zaroori)
const server = http.createServer(app);

// ✅ Socket.io initialize
export const io = initSocket(server);

/** ---------------------------------------
 * 🚀 API Routes
 ----------------------------------------*/

// ✅ All APIs → /api se start honge
app.use("/api", router);

/** ---------------------------------------
 * ✅ Health Check Route
 * (Server chal raha hai ya nahi)
 ----------------------------------------*/
app.get("/health", (_, res) => res.json({ status: true, message: "Helth is OK" }));

/** ---------------------------------------
 * ❌ 404 + 🛑 Error Handling
 ----------------------------------------*/

// ✅ Undefined routes handle karega
app.use(notFound);

// ✅ Server errors ko handle karega
app.use(onError);

// ✅ Server start + DB connection
server.listen(env.PORT, async () => {
  await connectDB();
  console.log(`✅ server up on http://localhost:${env.PORT}`);
});
