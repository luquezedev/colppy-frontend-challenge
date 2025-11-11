import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Función para generar un item de métricas
function generateMetrics() {
  return {
    timestamp: new Date().toISOString(),
    activeUsers: Math.floor(Math.random() * 5000),
    newUsers: Math.floor(Math.random() * 200),
    revenue: +(Math.random() * 10000).toFixed(2),
    churnRate: +(Math.random() * 0.15).toFixed(3),
    byRegion: {
      US: Math.floor(Math.random() * 2000),
      EU: Math.floor(Math.random() * 1500),
      LATAM: Math.floor(Math.random() * 1200),
      APAC: Math.floor(Math.random() * 1000),
    },
  };
}

// Endpoint de métricas simuladas con volumen
app.get("/metrics", (req, res) => {
  const { count = 20 } = req.query;
  const metricsArray = Array.from({ length: Number(count) }, () => generateMetrics());
  res.json(metricsArray);
});

// Para Vercel
export default app;

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(4000, () =>
    console.log("Mock API running on http://localhost:4000")
  );
}