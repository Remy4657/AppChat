import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { otpRateLimiter } from "../middlewares/otpMiddleware.js";

const router = express.Router();

router.post("/generate", otpRateLimiter, sendOtp);
router.post("/verify", verifyOtp);

export default router