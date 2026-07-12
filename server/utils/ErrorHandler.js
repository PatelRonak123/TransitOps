import { ENV } from "../config/env.js";

export const ErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  const errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    statusCode,
    errorCode,
    message,
    errors,
    stack: ENV.NODE_ENV === "development" ? err.stack : undefined,
  });
};
