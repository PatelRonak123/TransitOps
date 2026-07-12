import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authService } from "../service/authService.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { ENV } from "../config/env.js";


export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.findUserByEmail(email);
  if (!user) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials", "INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User account is suspended", "ACCOUNT_SUSPENDED");
  }

  // Generate JWT token with ID and role
  const token = generateToken({ id: user.id, role: user.role });

  const cookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };

  res.cookie("token", token, cookieOptions);

  // Return the user object formatted according to requirements
  const responseData = {
    success: true,
    user: {
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      role: user.role,
    },
  };

  return res.status(200).json(responseData);
});


export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "production",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});


export const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user has already been populated and sanitized by verifyJWT middleware
  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      full_name: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
    },
  });
});


export const register = asyncHandler(async (req, res) => {
  const { email, password, full_name, role } = req.body;

  const existingUser = await authService.findUserByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "Email is already registered", "EMAIL_EXISTS");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await authService.createUser({
    fullName: full_name,
    email,
    password: hashedPassword,
    role,
    isActive: true,
  });

  const responseData = {
    success: true,
    user: {
      id: newUser.id,
      full_name: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    },
  };

  return res.status(201).json(responseData);
});
