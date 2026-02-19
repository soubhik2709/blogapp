import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/auth.middleware.js";
import {updateUserPassword,deleteuser,findData,getBlogsController,toggleLikeController} from "../controllers/user.controller.js";

//Cursor-Based Pagination
router.get("/:userId/blogs",findData);
router.get("/search",getBlogsController);//search 

router.use(authMiddleware);
router.post("/:blogId/likes", toggleLikeController);//normal like
router.post("/updatepassword",updateUserPassword);
router.post("/deleteUser",deleteuser);


export default router;

// 69871a6eb7bd889ed48d0608