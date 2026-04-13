import express from 'express';
import { authMe } from '../controllers/userController.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', authMe);

export default router;