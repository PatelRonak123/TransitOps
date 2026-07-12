import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authService } from "../service/authService.js";
import { loginHistoryService } from "../service/loginHistoryService.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { parseUserAgent } from "../utils/deviceDetector.js";
import { ENV } from "../config/env.js";
import { auditLogger } from "../utils/auditLogger.js";

// Feature 11: Constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const JWT_NORMAL_EXPIRY = "1d";
const JWT_REMEMBER_EXPIRY = "30d";
const COOKIE_NORMAL_EXPIRY = 24 * 60 * 60 * 1000; // 1 day
const COOKIE_REMEMBER_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

export const getPermissionsForRole = (role) => {
  const permissionsMap = {
    "Fleet Manager": [
      "vehicles:create", "vehicles:read", "vehicles:update", "vehicles:delete",
      "drivers:create", "drivers:read", "drivers:update", "drivers:delete",
      "trips:create", "trips:read", "trips:update", "trips:delete", "trips:dispatch", "trips:complete", "trips:cancel",
      "maintenance:create", "maintenance:read", "maintenance:update", "maintenance:delete", "maintenance:start", "maintenance:complete", "maintenance:cancel",
      "fuel:create", "fuel:read", "fuel:update", "fuel:delete",
      "expenses:create", "expenses:read", "expenses:update", "expenses:delete"
    ],
    "Dispatcher": [
      "vehicles:read",
      "drivers:read",
      "trips:create", "trips:read", "trips:update", "trips:dispatch", "trips:complete", "trips:cancel",
      "maintenance:read",
      "fuel:create", "fuel:read",
      "expenses:read"
    ],
    "Safety Officer": [
      "vehicles:read",
      "drivers:read",
      "trips:read",
      "maintenance:read",
      "fuel:read",
      "expenses:read"
    ],
    "Financial Analyst": [
      "vehicles:read",
      "drivers:read",
      "trips:read",
      "maintenance:read",
      "fuel:read",
      "expenses:create", "expenses:read", "expenses:update"
    ]
  };
  return permissionsMap[role] || [];
};

export const login = asyncHandler(async (req, res) => {
  const { email, password, role, rememberMe } = req.body;
  const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;
  const userAgent = req.headers["user-agent"] || null;
  
  // Feature 7: Device Information
  const { browser, operatingSystem, deviceType } = parseUserAgent(userAgent);

  const user = await authService.findUserByEmail(email);
  if (!user) {
    // Feature 6: Log failed attempts even when user is not found
    await loginHistoryService.createLoginHistory({
      email,
      role,
      ipAddress,
      browser,
      operatingSystem,
      deviceType,
      status: "FAILED"
    });
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  // Feature 4: Locked Account Response
  if (user.accountLockedUntil) {
    const lockedUntilDate = new Date(user.accountLockedUntil);
    const now = new Date();

    if (lockedUntilDate > now) {
      const remainingMinutes = Math.ceil((lockedUntilDate - now) / (60 * 1000));
      
      await loginHistoryService.createLoginHistory({
        userId: user.id,
        email,
        role,
        ipAddress,
        browser,
        operatingSystem,
        deviceType,
        status: "LOCKED"
      });

      await auditLogger({
        userId: user.id,
        action: "LOGIN",
        module: "Authentication",
        description: `Login attempted on locked user account: ${email}`,
        request: req,
        status: "FAILED"
      });

      return res.status(423).json({
        success: false,
        message: "Account is locked.",
        lockedUntil: lockedUntilDate.toISOString(),
        remainingMinutes
      });
    } else {
      // Auto-unlock
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
      const lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
      
      await authService.updateUserLockout(user.id, {
        failedLoginAttempts: attempts,
        accountLockedUntil: lockedUntil,
        lastFailedLogin: new Date()
      });

      await loginHistoryService.createLoginHistory({
        userId: user.id,
        email,
        role,
        ipAddress,
        browser,
        operatingSystem,
        deviceType,
        status: "LOCKED"
      });

      await auditLogger({
        userId: user.id,
        action: "ACCOUNT_LOCKED",
        module: "Authentication",
        description: `User account locked due to 5 consecutive failed logins: ${email}`,
        request: req,
        status: "FAILED"
      });

      return res.status(423).json({
        success: false,
        message: "Account locked due to multiple failed login attempts.",
        lockedFor: `${LOCK_DURATION_MINUTES} minutes`,
        lockedUntil: lockedUntil.toISOString()
      });
    } else {
      await authService.updateUserLockout(user.id, {
        failedLoginAttempts: attempts,
        accountLockedUntil: null,
        lastFailedLogin: new Date()
      });

      await loginHistoryService.createLoginHistory({
        userId: user.id,
        email,
        role,
        ipAddress,
        browser,
        operatingSystem,
        deviceType,
        status: "FAILED"
      });

      await auditLogger({
        userId: user.id,
        action: "LOGIN",
        module: "Authentication",
        description: `Failed login attempt (invalid password) for user: ${email}`,
        request: req,
        status: "FAILED"
      });

      // Feature 3: Better Login Responses (Invalid Credentials)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
        remainingAttempts: MAX_LOGIN_ATTEMPTS - attempts
      });
    }
  }

  // Feature 1: Role Validation During Login
  if (user.role !== role) {
    await loginHistoryService.createLoginHistory({
      userId: user.id,
      email,
      role,
      ipAddress,
      browser,
      operatingSystem,
      deviceType,
      status: "ROLE_MISMATCH"
    });

    return res.status(403).json({
      success: false,
      message: "Invalid role selected."
    });
  }

  if (!user.isActive) {
    await loginHistoryService.createLoginHistory({
      userId: user.id,
      email,
      role,
      ipAddress,
      browser,
      operatingSystem,
      deviceType,
      status: "FAILED"
    });
    throw new ApiError(403, "User account is suspended", "ACCOUNT_SUSPENDED");
  }

  // Reset failed login attempt counters
  if (user.failedLoginAttempts > 0 || user.accountLockedUntil !== null) {
    await authService.updateUserLockout(user.id, {
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastFailedLogin: null
    });
  }

  // Feature 2: Remember Me support for JWT Expiries
  const tokenExpiry = rememberMe ? JWT_REMEMBER_EXPIRY : JWT_NORMAL_EXPIRY;
  const cookieMaxAge = rememberMe ? COOKIE_REMEMBER_EXPIRY : COOKIE_NORMAL_EXPIRY;

  const token = generateToken({ id: user.id, role: user.role }, { expiresIn: tokenExpiry });

  const cookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "production",
    maxAge: cookieMaxAge,
  };

  res.cookie("token", token, cookieOptions);

  // Feature 5: Success Response formatting
  const nameParts = (user.fullName || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const permissions = getPermissionsForRole(user.role);

  await loginHistoryService.createLoginHistory({
    userId: user.id,
    email,
    role,
    ipAddress,
    browser,
    operatingSystem,
    deviceType,
    status: "SUCCESS"
  });

  await auditLogger({
    userId: user.id,
    action: "LOGIN",
    module: "Authentication",
    description: `User logged in successfully: ${email} (${role})`,
    request: req,
    status: "SUCCESS"
  });

  return res.status(200).json({
    success: true,
    message: "Login Successful",
    token,
    user: {
      id: user.id,
      firstName,
      lastName,
      email: user.email,
      role: user.role,
      permissions
    }
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "production",
  });

  if (req.user) {
    await auditLogger({
      userId: req.user.id,
      action: "LOGOUT",
      module: "Authentication",
      description: `User logged out successfully: ${req.user.email}`,
      request: req,
      status: "SUCCESS"
    });
  }

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// Feature 8: Updated Current User API
export const getCurrentUser = asyncHandler(async (req, res) => {
  const nameParts = (req.user.fullName || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const permissions = getPermissionsForRole(req.user.role);

  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      firstName,
      lastName,
      email: req.user.email,
      role: req.user.role,
      permissions
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
