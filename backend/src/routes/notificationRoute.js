import express from 'express';
import { markReadNotification, getAllNotification } from '../controllers/notificationController.js';

const router = express.Router();

// GET /api/users/me
router.put('/read-all', markReadNotification);
router.get('/', getAllNotification);

export default router