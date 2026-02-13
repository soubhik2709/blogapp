import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/auth.middleware.js";
import {updateUserPassword,deleteuser,findData} from "../controllers/user.controller.js";

//Cursor-Based Pagination
router.get("/:userId/blogs",findData);

router.use(authMiddleware);
router.post("/updatepassword",updateUserPassword);
router.post("/deleteUser",deleteuser);


export default router;

