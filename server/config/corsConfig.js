import { ENV } from "./env.js";

export const corsMiddleware = () => {
  return (req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [ENV.CLIENT_BASE_URL || "http://localhost:5173"];

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      // Fallback or default allow if client base url is not fully resolved
      res.setHeader("Access-Control-Allow-Origin", ENV.CLIENT_BASE_URL || "http://localhost:5173");
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    next();
  };
};


export const corsPreflight = (req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;
    const allowedOrigins = [ENV.CLIENT_BASE_URL || "http://localhost:5173"];

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", ENV.CLIENT_BASE_URL || "http://localhost:5173");
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.sendStatus(204);
  }
  next();
};