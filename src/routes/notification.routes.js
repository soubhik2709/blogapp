import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import blogOwnershipMiddleware from "../middleware/blogOwnership.middleaware.js";
import {
    getNotification,getUnreadCount,markAllRead,
} from "../controllers/notification.controller.js"

const router = express.Router();

router.use(authMiddleware,blogOwnershipMiddleware);
router.get("/",getNotification);
router.get("/unread-count",getUnreadCount);
router.patch("/mark-read",markAllRead); //patch/notificaton/mark-read

export default router;