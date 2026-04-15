import express from 'express';
import { fetchMe } from '../controllers/userController.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', fetchMe);

export default router;