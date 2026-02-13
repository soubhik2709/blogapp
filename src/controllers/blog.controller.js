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

export const getsingleblog = async (req, res) => {
  try {
    const blogId = req.blog._id;
    const user = req.user; //may be undefined
    console.log(user);

    const blog = await getSingleBlog(blogId);
    console.log(blog);

    if (blog.isPublished) {
      //if published -> anyone can read
      console.log("thsiis insise the blogispublished");
      return res.status(200).json({
        blog: blog,
      });
    }

    // If NOT published → only owner or admin
    if (
      (user && blog.userId.toString() === user.userId.toString()) ||
      user.role === "admin"
    ) {
      return res.status(200).json({
        blog: blog,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "blog not found",
      error: error.message,
    });
  }
};




