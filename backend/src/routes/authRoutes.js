import express from "express";
import { register, login, logout, refreshToken } from "../controllers/authController.js";

const router = express.Router();

// POST /api/users/register
router.post("/signup", register);
router.post("/signin", login);
router.post("/signout", logout);
router.post("/refresh", refreshToken);

export default router;