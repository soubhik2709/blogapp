//src/routes/auth.router.js
import express from "express";
const router = express.Router();

import {signup,login,logout,refreshAccessToken,verifyEmail} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout",authMiddleware, logout);
router.post("/refreshAccessToken", refreshAccessToken);//no middleware
router.get("/verify-email",verifyEmail);

export default router;




/* 

1.After Logout if accesToken not expire then anyone can logout-->
==>
What Google / GitHub / Netflix do:
short access token TTL
refresh token rotation
device/session awareness
logout kills refresh token
accept short risk window


*/