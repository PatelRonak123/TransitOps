import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { corsMiddleware, corsPreflight } from "./config/corsConfig.js";
import authRoutes from "./routes/authRoute.js";
import { ErrorHandler } from "./utils/ErrorHandler.js";
import { ENV } from "./config/env.js";

export const app = express();

const isProd = ENV.NODE_ENV === "production";

if (isProd) {
  app.set("trust proxy", true);
}

app.use(corsMiddleware());
app.use(corsPreflight);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve("uploads")));

// Route Registration
app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.send("Server is running and healthy!");
});

// Centralized Error Handler
app.use(ErrorHandler);

export default app;
