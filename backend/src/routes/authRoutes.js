import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// POST /api/users/register
router.post("/signup", register);
router.post("/signin", login);

export default router;