const express = require("express");
const router = express.Router();

const userIdmiddleware = require("../middleware/userId.middleaware");
const controller = require("../controllers/blog.controller");

router.post("/saveblog/:userId",userIdmiddleware,controller.saveBlogs);//how token middleware can change this route /:userId?
router.get("/showblog/:userId",userIdmiddleware,controller.showBlogs);//userIdmiddleware is written many times..
router.post("/updateblog/:userId",userIdmiddleware, controller.updateBlogs);

module.exports = router;

