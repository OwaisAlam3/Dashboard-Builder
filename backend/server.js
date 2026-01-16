import express from 'express';
import cors from 'cors';
import dashboardRoutes from './routes/dashboard.js';
import templateRoutes from './routes/template.js';
import healthRoutes from './routes/health.routes.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "dashboard-backend",
    time: new Date().toISOString()
  });
});

app.use('/api/dashboards', dashboardRoutes);
app.use('/api/templates', templateRoutes);
app.use("/api/health", healthRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
