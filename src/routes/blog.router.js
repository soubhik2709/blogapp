import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/auth.middleware.js";
import blogOwnershipMiddleware from "../middleware/blogOwnership.middleaware.js";
import {
  createBlogs,
  showMyBlog,
  updateBlogs,
  deleteoneblog,
  deleteallblogs,
  getpublishedblogs,
  getsingleblogController
} from "../controllers/blog.controller.js";



//pagination 
// router.get("/cursors/:userId",findData);
router.get("/blogs", getpublishedblogs);//public page

router.use(authMiddleware);//Run for every request.

router.post("/",createBlogs);
router.get("/my-blogs",showMyBlog);
router.put("/:blogId",blogOwnershipMiddleware,updateBlogs);
router.delete("/:blogId",blogOwnershipMiddleware,deleteoneblog);
router.delete("/",deleteallblogs);
router.get("/:blogId",blogOwnershipMiddleware, getsingleblogController);

export default router;




/*
Ownership middleware is for WRITE operations, not READ operations.Reading and modifying are different security problems.
blogOwnershipMiddleware answers one specific question:
❓ “Is this user allowed to MODIFY this blog?”

*/