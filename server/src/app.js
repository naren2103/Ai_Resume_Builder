// ============================================
// app.js - Express Application Setup
// ============================================

import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const app = express();

// ============================================
// Middleware
// ============================================

// Enable CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://localhost:5174',
      'https://ai-resume-builder-platform.vercel.app',
      'https://ai-resume-builder-gclv.onrender.com'
    ];
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true, // 🔥 important for auth cookies/JWT
}));

// Parse JSON
app.use(express.json({ limit: '10mb' }));

// Health check route (🔥 useful for debugging)
app.get('/', (req, res) => {
  res.send('🚀 API is running...');
});

// ============================================
// Routes
// ============================================

app.use('/api', routes);

// ============================================
// Error Handling
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

export default app;