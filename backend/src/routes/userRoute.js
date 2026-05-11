import express from 'express';
import { fetchMe } from '../controllers/userController.js';
import { searchUserByUsername } from '../controllers/userController.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', fetchMe);
router.get("/search", searchUserByUsername);
export default router;