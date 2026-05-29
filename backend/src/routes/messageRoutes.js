import express from "express";

import {
    sendDirectMessage,
    sendGroupMessage,
    retrieveMessage
} from "../controllers/messageController.js";
import {
    checkFriendship,
    checkGroupMembership,
} from "../middlewares/friendMiddleware.js";

const router = express.Router();

router.post("/direct", checkFriendship, sendDirectMessage);
router.post("/group", checkGroupMembership, sendGroupMessage);
router.delete("/delete", retrieveMessage)

export default router;