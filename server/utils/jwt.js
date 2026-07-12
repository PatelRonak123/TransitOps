import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";


export const generateToken = (payload) => {
  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in the environment variables.");
  }
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });
};


export const verifyToken = (token) => {
  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in the environment variables.");
  }
  return jwt.verify(token, ENV.JWT_SECRET);
};
