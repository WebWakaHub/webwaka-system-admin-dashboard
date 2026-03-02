import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from 'dotenv';

// Load environment variables
config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'WebWaka API',
    version: '0.1.0'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to WebWaka API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

// API v1 routes placeholder
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    message: 'WebWaka API v1',
    status: 'operational'
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 WebWaka API listening on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
// Deployment trigger
// Final deployment trigger - Mon Mar  2 04:20:12 EST 2026
// Trigger deployment with improved health checks - Mon Mar  2 04:44:39 EST 2026
// Final deployment attempt with increased timeout - Mon Mar  2 05:11:14 EST 2026
