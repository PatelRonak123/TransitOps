import { ApiError } from "./ApiError.js";

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string") {
    throw new ApiError(400, "Email is required", "VALIDATION_ERROR");
  }

  if (!password || typeof password !== "string") {
    throw new ApiError(400, "Password is required", "VALIDATION_ERROR");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, "Invalid email format", "VALIDATION_ERROR");
  }

  next();
};


export const validateRegister = (req, res, next) => {
  const { email, password, full_name, role } = req.body;

  if (!email || typeof email !== "string") {
    throw new ApiError(400, "Email is required", "VALIDATION_ERROR");
  }

  if (!password || typeof password !== "string") {
    throw new ApiError(400, "Password is required", "VALIDATION_ERROR");
  }

  if (!full_name || typeof full_name !== "string") {
    throw new ApiError(400, "Full name is required", "VALIDATION_ERROR");
  }

  if (!role || typeof role !== "string") {
    throw new ApiError(400, "Role is required", "VALIDATION_ERROR");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, "Invalid email format", "VALIDATION_ERROR");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long", "VALIDATION_ERROR");
  }

  const allowedRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(
      400,
      `Invalid role. Allowed roles are: ${allowedRoles.join(", ")}`,
      "VALIDATION_ERROR"
    );
  }

  next();
};
