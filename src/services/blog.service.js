// blogservice.js
import mongoose, { Types } from "mongoose";
import blogDetailSchema from "../models/blogschema.js";
import blogLikeModel from "../models/blogLike.js";
import { redisClient } from "../config/redis.js";
import {getOrInitCounter} from "../services/counter.service.js";
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

    //redis 
  const keytoDelete = [
    `blog:${blogId}`,
    `blog:${blogId}:likes`,
    `blog:${blogId}:comment`,//share due
  ];

await redisClient.del(keytoDelete);

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



//getSingleBlog----cache aside using redis for get a single blog
export const getSingleBlog = async (blogId, user) => {

  const cacheBlogKey = `blog:${blogId}`;
  let cacheBlog = await redisClient.get(cacheBlogKey);

  if (cacheBlog) {
    console.log("cache Hit ✅")
    cacheBlog = JSON.parse(cacheBlog); 
   console.log("the blog is ",cacheBlog);
  } else {
    console.log("cahce Blog Miss ❌");
    cacheBlog = await blogDetailSchema.findById( blogId );

    if (!cacheBlog) {
    
      throw new Error("Blog not found");
    }

    if (cacheBlog.isPublished) {
      await redisClient.set(cacheBlogKey, JSON.stringify(cacheBlog), { EX: 600 });
      const check = await redisClient.get(cacheBlogKey);
     console.log("After set, redis has:", check);
    }

  }

if(!cacheBlog.isPublished){
  if(!user || (cacheBlog.userId.toString() !== user.userId.toString() && user.role !== "admin")){
    throw new Error("Not authorized");
  }
}

const cacheLikeKey = `blog:${blogId}:likes`;
let likeCount = await getOrInitCounter(cacheLikeKey, () =>
    blogLikeModel.countDocuments({ blogId }),
  );
  // commentcount, shareCount,etc
  
  return {
    ...cacheBlog.toObject?.()??cacheBlog,
    totalLikes:Number(likeCount),

  }
/* 
 1.   ...cacheBlog.toObject?.()??cacheBlog,//what is this ? define with example?
Case 1: From DB

cacheBlog = mongooseDoc
cacheBlog.toObject?.() → works

Case 2: From Redis

cacheBlog = { title: "Hello" }
cacheBlog.toObject?.() → undefined
?? cacheBlog → fallback

Brilliant pattern.


    
2....cacheBlog.toObject?.()??cacheBlog,//why  3 dots here?
with ... dots 

{
  "_id": "...",
  "title": "...",
  "content": "...",
  "totalLikes": 10
}

without ... dots

{
  "cacheBlog": { ... },
  "totalLikes": 10
}

3.if(!likeCount) -->bug--> could be 0
do 
null → not exist
"0" → exists but zero likes
 
} 


-------------------Todo------------------------------
this problem can be solve by using redis hash

Instead of storing separate keys:

blog:123:likes
blog:123:comments
blog:123:shares

You can use Redis Hash:

blog:123:metrics

And store:

{
  likes: 10,
  comments: 5,
  shares: 2,
  views: 100
}

const metrics = await redisClient.hGetAll(`blog:${blogId}:metrics`);


*/


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
