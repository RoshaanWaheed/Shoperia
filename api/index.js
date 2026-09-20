import express from 'express';
import dotenv from 'dotenv';
import connectDB from '../backend/config/db.js';
import cors from 'cors';
import authRoutes from '../backend/routes/authRoutes.js';
import productRoutes from '../backend/routes/productRoutes.js';
import orderRoutes from '../backend/routes/orderRoutes.js';
import userRoutes from '../backend/routes/userRoutes.js';
import uploadRoutes from '../backend/routes/uploadRoutes.js';
import errorMiddleware from '../backend/middleware/errorMiddleware.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorMiddleware);

export default async (req, res) => {
  await connectDB();
  return app(req, res);
};
