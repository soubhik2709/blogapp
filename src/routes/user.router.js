import express from "express";
const router = express.Router();
// const authMiddleware = require("../middleware/auth.middleware");

import {updateUserPassword,deleteuser} from "../controllers/user.controller.js";

// router.use(authMiddleware);
router.post("/updatepassword",updateUserPassword);
router.post("/deleteUser",deleteuser);


export default router;

