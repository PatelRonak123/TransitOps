import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";


export const generateToken = (payload, options = {}) => {
  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in the environment variables.");
  }
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: options.expiresIn || "7d",
  });
};


export const verifyToken = (token) => {
  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in the environment variables.");
  }
  return jwt.verify(token, ENV.JWT_SECRET);
};
