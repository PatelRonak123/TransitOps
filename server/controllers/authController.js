import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authService } from "../service/authService.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { ENV } from "../config/env.js";

const MAX_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_MINUTES = 15;

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;
  const userAgent = req.headers["user-agent"] || null;

  const user = await authService.findUserByEmail(email);
  if (!user) {
    await authService.createAuthLog({
      email,
      ipAddress,
      userAgent,
      status: "FAILED"
    });
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  if (user.accountLockedUntil) {
    const lockedUntilDate = new Date(user.accountLockedUntil);
    const now = new Date();

    if (lockedUntilDate > now) {
      await authService.createAuthLog({
        userId: user.id,
        email,
        ipAddress,
        userAgent,
        status: "LOCKED"
      });

      return res.status(423).json({
        success: false,
        message: "Account is locked. Please try again later.",
        lockedUntil: lockedUntilDate.toISOString()
      });
    } else {
      await authService.updateUserLockout(user.id, {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastFailedLogin: null
      });
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = null;
      user.lastFailedLogin = null;
    }
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    const attempts = user.failedLoginAttempts + 1;

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + ACCOUNT_LOCK_MINUTES * 60 * 1000);
      
      await authService.updateUserLockout(user.id, {
        failedLoginAttempts: attempts,
        accountLockedUntil: lockedUntil,
        lastFailedLogin: new Date()
      });

      await authService.createAuthLog({
        userId: user.id,
        email,
        ipAddress,
        userAgent,
        status: "LOCKED"
      });

      return res.status(423).json({
        success: false,
        message: "Account locked due to multiple failed login attempts.",
        lockedFor: `${ACCOUNT_LOCK_MINUTES} minutes`,
        lockedUntil: lockedUntil.toISOString()
      });
    } else {
      await authService.updateUserLockout(user.id, {
        failedLoginAttempts: attempts,
        accountLockedUntil: null,
        lastFailedLogin: new Date()
      });

      await authService.createAuthLog({
        userId: user.id,
        email,
        ipAddress,
        userAgent,
        status: "FAILED"
      });

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        remainingAttempts: MAX_LOGIN_ATTEMPTS - attempts
      });
    }
  }

  if (!user.isActive) {
    await authService.createAuthLog({
      userId: user.id,
      email,
      ipAddress,
      userAgent,
      status: "FAILED"
    });
    throw new ApiError(403, "User account is suspended", "ACCOUNT_SUSPENDED");
  }

  if (user.failedLoginAttempts > 0 || user.accountLockedUntil !== null) {
    await authService.updateUserLockout(user.id, {
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastFailedLogin: null
    });
  }

  await authService.createAuthLog({
    userId: user.id,
    email,
    ipAddress,
    userAgent,
    status: "SUCCESS"
  });

  const token = generateToken({ id: user.id, role: user.role });

  const cookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, cookieOptions);

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
