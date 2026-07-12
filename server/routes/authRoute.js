import { Router } from "express";
import { login, logout, getCurrentUser, register } from "../controllers/authController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { validateLogin, validateRegister } from "../utils/validation.js";

const router = Router();

// Registration route for local setup & testing
router.post("/register", validateRegister, register);

// Login route
router.post("/login", validateLogin, login);

// Logout route
router.post("/logout", logout);

// Get current logged-in user profile
router.get("/me", verifyJWT, getCurrentUser);

export default router;
