import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import path from "path";
import mongoose from "mongoose";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import pino from "pino";
import userRoute from "./routes/user";
import productRoute from "./routes/products";
import cartRoute from "./routes/cart";
import adminRoute from "./routes/admin";
import uploadRoute from "./routes/upload";
import { seedInitialProducts } from "./services/product";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(compression());
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : "http://localhost:5173";

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(pinoHttp({ logger }));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/upload", uploadRoute);

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URL || "")
  .then(() => {
    logger.info("MongoDB Is Connected");
    seedInitialProducts();
    app.listen(port, () =>
      logger.info(`Server running on PORT: ${port} http://localhost:${port}`)
    );
  })
  .catch((err) => {
    logger.error(err, "Cannot Connect To MongoDB");
    process.exit(1);
  });
