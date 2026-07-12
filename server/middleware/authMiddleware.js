import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/jwt.js";
import { authService } from "../service/authService.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  // Also support extracting token from the Authorization: Bearer header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Access denied. No token provided.", "UNAUTHORIZED");
  }

  try {
    const decoded = verifyToken(token);
    const user = await authService.findUserById(decoded.id);

    if (!user) {
      throw new ApiError(401, "User not found.", "UNAUTHORIZED");
    }

    if (!user.isActive) {
      throw new ApiError(401, "User account is inactive.", "UNAUTHORIZED");
    }

    // Remove the password field from req.user
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token.", "UNAUTHORIZED");
  }
});


export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "Access forbidden. Insufficient permissions.", "FORBIDDEN");
    }

    next();
  };
};
