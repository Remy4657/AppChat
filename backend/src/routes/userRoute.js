import express from 'express';
import { fetchMe, uploadAvatar, searchUserByUsername } from '../controllers/userController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', fetchMe);
router.get("/search", searchUserByUsername);
router.post("/uploadAvatar", upload.single("file"), uploadAvatar);
export default router;