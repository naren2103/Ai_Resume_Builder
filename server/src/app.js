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
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'],
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