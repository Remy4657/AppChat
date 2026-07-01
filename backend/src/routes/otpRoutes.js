import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { otpRateLimiter } from "../middlewares/otpMiddleware.js";
import { asyncHandler } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/generate", sendOtp);
router.post("/verify", verifyOtp);

export default router