// blogservice.js
import mongoose, { Types } from "mongoose";
import blogDetailSchema from "../models/blogschema.js";

//create or blog save to database
export const blogSavetoDB = async (id, title, content, isPublished) => {
  const blog = await blogDetailSchema.create({
    userId: id,
    blogtitle: title,
    blogContent: content,
    ...(isPublished !== undefined && {
      isPublished: isPublished === true || isPublished === "true",
    }),
  });
  return blog;
};

//show all blog to his user
export const myBlogs = async (userId) => {
  // const allBlogs = await blogDetailSchema.find({ userId }).populate("userId");
  const allBlogs = await blogDetailSchema.find({ userId });
  return allBlogs;
};

//blog updated
export const blogUpdatefromDB = async (blogId, content, title, isPublished) => {
  // console.log("id , title, content is", blogId, title, content, isPublished);

  const updateData = {
    ...(title && { blogtitle: title }),
    ...(content && { blogContent: content }),
    ...(isPublished !== undefined && {
      isPublished: isPublished === true || isPublished === "true",
    }),
  }; //...false does nothing

  const updatedPost = await blogDetailSchema.findOneAndUpdate(
    { _id: blogId },
    updateData,
    { new: true, runValidators: true },
  );
  console.log(updatedPost);
  return updatedPost;
};

// delete one blog
export const deleteOneBlogFromDB = async (id) => {
  const result = await blogDetailSchema.findByIdAndDelete(id);
  console.log("delte one blog is ", result);
  return result;
};

//delete all blogs
export const deleteAllBlog = async (userId) => {
  return await blogDetailSchema.deleteMany({ userId });
};

//get isPublished blog
export const getPublishedBlogs = async () => {
  const result = await blogDetailSchema.findOne({ isPublished: true });
  return result;
};

//getSingleBlog
export const getSingleBlog = async (blogId) => {
  const result = await blogDetailSchema.findById(blogId);
  return result;
};












/*
Note->
find() returns the array
2.Every pagination query needs TWO filters:
one for ownership (userId) and one for continuation (cursor).

doubt-->

1.change the name of this functions
2.should i use userId or the blogId to query the blog and fetch the details from the postman?

 */

/* 
if blogPerson is user or admin  then he can acccess the blog 
if user is login then can verified then can add blog

Mongo Note-->
new: true: By default, Mongoose returns the document as it was before the update. Set this to true to get the modified document back.
runValidators: true: Since updates bypass the standard schema validation by default, this ensures the new data still follows your blog schema rules.


 */
