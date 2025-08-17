import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './database.js';
import promptRoutes from './routes/prompts.js';
import folderRoutes from './routes/folders.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const db = new Database();
await db.init();

// Make database available to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/api/prompts', promptRoutes);
app.use('/api/folders', folderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
