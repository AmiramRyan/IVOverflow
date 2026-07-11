import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import questionRoutes from './routes/question.routes';
import interactionRoutes from './routes/interaction.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.DATABASE_URL;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/interactions', interactionRoutes);

//Initialization
if (!MONGO_URI) {
  console.error('Error: DATABASE_URL is missing in environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running smoothly on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failure:', err);
  });