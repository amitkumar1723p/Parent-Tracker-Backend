import express from 'express';
import cors from 'cors';
// import { connectDB } from './config/db.js';
// import userRoutes from './routes/user.routes.js';
// import { errorHandler } from './middlewares/error.middleware.js';

const app = express();
app.use(cors());
app.use(express.json());

// connect db
// connectDB();

// routes
// app.use('/api/users', userRoutes);

// error handler
// app.use(errorHandler);

export default app;
