import dotenv from 'dotenv';
import express from 'express';
import storeRoutes from './routes/storeRoutes.js';
import morgan from 'morgan';
import courierRoutes from './routes/courier.Routes.js';
import mongoose from 'mongoose';

dotenv.config();
const app = express();
app.use(morgan('dev'));
const port = process.env.PORT || 5000;

// Connect to MongoDB
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  
  .catch(err => console.error("❌ MongoDB connection error:", err));
}

mongoose.connection.once("open", () => {
  console.log("Connected DB =", mongoose.connection.name);
});

app.use(express.json());
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://shopify-dashboard-topaz.vercel.app",
  ];
  const origin = req.get("origin");

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/api", storeRoutes);
app.use("/api/v8/track", courierRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
