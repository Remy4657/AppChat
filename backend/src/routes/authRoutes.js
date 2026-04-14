import express from "express";
import { register, login, logout } from "../controllers/authController.js";

const router = express.Router();

// POST /api/users/register
router.post("/signup", register);
router.post("/signin", login);
router.post("/signout", logout);

export default router;