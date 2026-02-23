//blogcontroller.js
import {
  blogSavetoDB,
  myBlogs,
  blogUpdatefromDB,
  deleteAllBlog,
  deleteOneBlogFromDB,
  getPublishedBlogs,
  getSingleBlog,
} from "../services/blog.service.js";

import { redisClient } from "../config/redis.js";

export const createBlogs = async (req, res) => {
  console.log("request from backend for saveBlog is", req.body);

  const { blogtitle, blogContent, isPublished } = req.body;
  const { userId } = req.user;
  try {
    const result = await blogSavetoDB(
      userId,
      blogtitle,
      blogContent,
      isPublished,
    );
    res.status(201).json({ message: "Blog saved", blogId: result._id, result });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Blog  Failed to saved", message: error.message });
  }
};

export const showMyBlog = async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await myBlogs(userId);
    res.status(200).json({ message: "Blog is", result });
  } catch (error) {
    res
      .status(500) //did we use 500 for fetching error?
      .json({ message: error.message });
  }
};

export const updateBlogs = async (req, res) => {
  const { blogtitle, blogContent, isPublished } = req.body;
  try {
    const blog = req.blog; //got the whole blog cause of ownershiMiddle
    // console.log("the blog from update blog is  is",blog.);
    const result = await blogUpdatefromDB(
      blog._id,
      blogContent,
      blogtitle,
      isPublished,
    );
    res.status(200).json({ message: "Blog is updated", result });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Blog Failed to update", message: error.message });
  }
};

export const deleteoneblog = async (req, res) => {
  try {
    const id = req.blog._id;
    console.log("blog id is", id);
    const result = await deleteOneBlogFromDB(id);
    return res.status(200).json({
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Blog Failed to delete", message: error.message });
  }
};

export const deleteallblogs = async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await deleteAllBlog(userId);
    return res.status(200).json({
      message: "All blogs deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "All Blog Failed to delete", message: error.message });
  }
};

export const getpublishedblogs = async (req, res) => {
  try {
    const result = await getPublishedBlogs();
    return res.status(200).json({
      blog: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "blog not found",
    });
  }
};

//cache aside using redis for get a single blog
export const getsingleblog = async (req,res)=>{
  try {
    const {blogId} = req.params;
    const cacheKey = `blog:${blogId}`;
    const user = req.user;
    console.log("BlogId  is  ",blogId);

    //check cache
    const cacheBlog = await redisClient.get(cacheKey);
    let blog;

    if(cacheBlog){
     console.log("Cache Hit ✅");
     blog= JSON.parse(cacheBlog);
    }else{
  console.log("Cache Miss ❌ → Fetching from DB");

   blog = await getSingleBlog(blogId);

  if(!blog){
    return res.status(404).json({ message: "Blog not found" });
  }

    // 🔐 Authorization check AFTER we have blog data
    if(blog.isPublished){
      //set the blog into the database
      await redisClient.set(
        cacheKey,
        JSON.stringify(blog),
        { EX: 600 }        
      )};
      // const test = await redisClient.get(cacheKey);
      // if(!test)console.log("cache is not saved");
  }

if(blog.isPublished){
   return res.status(200).json({
        success:true,
        data:blog,
      });
}

    if(user && (blog.userId.toString()=== user.userId.toString()|| user.role ==="admin")){
      return res.status(200).json(
        {
          success:true,
          data:blog,
        });
    }

    return res.status(403).json({
      message:"Not authorized to view this blog",
    });

  } catch (error) {
      return res.status(500).json({
      message: "Blog not found",
      error: error.message,
    });
  }
}