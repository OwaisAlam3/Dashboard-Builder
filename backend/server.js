import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dashboardRoutes from './routes/dashboards.js';
import templateRoutes from './routes/templates.js';
import embedRoutes from './routes/embed.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Embed-Token']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/dashboards', dashboardRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/embed', embedRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}`);
  console.log(`🔗 Embed endpoint: http://localhost:${PORT}/api/embed`);
});

export default app;