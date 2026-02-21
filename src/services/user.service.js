//src/service/user.service.js

import blogPeopleSchema from "../models/blogPeopleSchema.js";
import blogDetailSchema from "../models/blogschema.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Types } from "mongoose";
import blogLikeModel from "../models/blogLike.js";
import BlogCommentModel from "../models/blogComment.js";

export const updatePassword = async (email, oldPassword, newPassword) => {
  const userExist = await blogPeopleSchema.findOne({ email });
  if (!userExist) throw new Error("Your mail is wrong");
  const vlaidPassword = await bcrypt.compare(oldPassword, userExist.password);
  if (!vlaidPassword) throw new Error("Old Password is not Matching");
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  userExist.password = hashedPassword;
  await userExist.save();
  return userExist;
};

export const deleteUser = async (userId, password) => {
  const userExist = await blogPeopleSchema.findById(userId); //is it get from userid from middleware
  if (!userExist) throw new Error("User Not Found");
  const isMatch = await bcrypt.compare(password, userExist.password);
  if (!isMatch) throw new Error("Password is incorrect");
  await userExist.deleteOne();
  return true;
}; //is it for the admin or use can delete this ? or is it suppose to be delete your acccount?

//make forgetpassword,

//paginations main function
export const findDataPagination = async (userId, cursorId, sort, filters) => {
  const limit = 3;

  validateUser(userId);

  let query = buildFilterQuery(userId, filters);

  const sortOption = buildSortOption(sort);

  if (cursorId) {
    if (!Types.ObjectId.isValid(cursorId)) {
      throw new Error("Invalid cursorId");
    }
    query = await applyCursorPagination(query, cursorId, sortOption);
  }

  return await executePagination(query , sortOption, limit);
};

// private helper functions for pagination (not exported) ----------------------------------

//1.validate userId
const validateUser = (userId) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid UserId");
  }
  return new Types.ObjectId(userId);
};

// 2.buildFilterQuery
const buildFilterQuery = (userId, filters) => {
  if (!filters || typeof filters !== "object") {
    throw new Error("Invalid query");
  }
  const allowedFilters = ["isPublished", "blogtitle"]; //whiteListing

  const query = {
    userId: new Types.ObjectId(userId),
  };

  for (let [key, value] of Object.entries(filters)) {
    if (!allowedFilters.includes(key)) continue;

    if (key === "isPublished") {
      query[key] = value === "true";
    } else if (key === "blogtitle") {
      query[key] = {
        $regex: value.trim(), //find the docuement which contain this given value
        $options: "i", //for Ram, ram, RAM find the value.
      };
    } else {
      query[key] = value;
    }
  }
  /* 
Now the query becomes this
{
  userId: ObjectId("123abc"),
  blogtitle: {
    $regex: "react",
    $options: "i"
  },
  isPublished: true
} and this total will make the query filter to find the exact documents
*/
  // console.log("the query is", query);
  return query;
  // whiteListing, Type Conversion , Dynamic filters
};

//3.buildSortOption
const buildSortOption = (sort) => {
  // console.log("sort is ", sort);
  const allowedSortFields = [
    "_id",
    "createdAt",
    "updatedAt",
    "likes",
    "comments",
  ];

  const sortValue = Array.isArray(sort) ? sort : sort ? [sort] : []; //sort is have to be array now

  let sortOption = {};

  for (let item of sortValue) {
    if (typeof item !== "string") continue;
    const sortFields = item.split(",");

    for (let field of sortFields) {
      field = field.trim();
      let direction = 1;

      if (field.startsWith("-")) {
        direction = -1;
        field = field.slice(1);
      }
      if (!allowedSortFields.includes(field)) continue;
      sortOption[field] = direction;
    }
  }
  //default sortOption
  if (Object.keys(sortOption).length === 0) {
    sortOption = { _id: 1 };
  }
  // console.log("sortOption is", sortOption);
  return sortOption;
  /* features --Multi-field sorting,Direction parsing,Whitelisting sort fields,Default fallback
input is --sort is  -createdAt,updatedAt,-age
output is sortOption is { createdAt: -1, updatedAt: 1 } */
};

//4.applyCursorPagination
const applyCursorPagination = async (query, cursorId, sortOption) => {
  const firstSortField = Object.keys(sortOption)[0] || "_id"; //eg. createdAt
  const sortFieldsDirect = sortOption[firstSortField] ?? 1; //eg. -1 of createdAt:-1
  // console.log(firstSortField,sortFieldsDirect);

  const lastDoc = await blogDetailSchema.findById(cursorId);
  if (!lastDoc) {
    throw new Error("CursorId document not found");
  }
  //console.log("the lastDoc is",lastDoc);

  //If sorting done by _id
 else if (firstSortField === "_id") {
    query._id =
      sortFieldsDirect === 1 ? { $gt: lastDoc._id } : { $lt: lastDoc._id };
  }

  //Multi-field cursor in else part
  else {

    const cursorValue = lastDoc[firstSortField];
    // console.log("the cursurValue is ", cursorValue);

    if (cursorValue === undefined || cursorValue === null)
      throw new Error("The sort value is not defined or Invalid");

    query.$or = [
      {
        [firstSortField]:
          sortFieldsDirect === 1 ? { $gt: cursorValue } : { $lt: cursorValue }, //eg. createdAt $gt: or $lt: date
      },
      {
        [firstSortField]: cursorValue, //createdAt $gt: or $lt: date
        _id:
          sortFieldsDirect === 1 ? { $gt: lastDoc._id } : { $lt: lastDoc._id }, //eg. id $gt or $lt: idValue
      },
    ];
  }
  // console.log("Now the query at the cursorPagination is", query);
  return query;

  /* 
  input -createdAt,updatedAt,-age
  output createdAt:{$gt: or $lt: value of createdAt } same for others

  What It Should Do
Validate cursorId               
Fetch lastDoc
Determine first sort field
Check direction
Handle two cases:
Case A: Sorting by _id
Use $gt or $lt

Case B: Multi-field sort
Build $or condition:
First field greater than cursor value
OR same first field but _id greater
Merge this condition into existing query
Return updated query
  
inShort ->It modifies the query to fetch the next page.

  */
};

//5.query execution Pagination
const executePagination = async(query, sortOption, limit) => {
  const result = await blogDetailSchema.find(query).sort(sortOption).limit(limit+1);
  // console.log("The result from execute is",result);
  const hasMore = result.length > limit; 
  if (hasMore) result.pop(); //pop() removes the last element.

  const nextCursor = result.length ? result[result.length - 1]._id : null; // next cursorId
  return {
    result,
    nextCursor,
    hasMore,
  };
}

/* 
userId needed
cursorId needed
sort Option is--> sort -createdAt,updatedAt,-age
query value is (filters)--> isPublished,blogtitle 

*/
//--------------------------------------------------------------------

//searchFeature service

// export const getBlogs = async(queryParams)=>{
//   const {search , limit =10, cursorId} = queryParams;
//   console.log("the search",search,"limit is",limit,"cursorId",cursorId);


// let filter = {};
// let sort = {createAt:-1};
// let projection = {};//what is this use for?

// if(search){
//   filter.$text = {$search:search};
// }
// console.log("the search is ",search);//how to se the $search:keyword

// //Add relevance Score
// projection.score = {$meta:"textScore"};

// sort = {score:{$meta:"textScore"}};

// if(cursorId){
//   filter._id = {$lt:cursorId}//why lt not gt?
// }

// const blogs = await blogDetailSchema.find(filter,projection).sort(sort).limit(Number(limit));

// return blogs;//should i return the cursorId ?
// }

export const getBlogs = async(queryParams)=>{
  const {q, limit=10,cursorId} = queryParams;
  console.log("the search",q,"limit is",limit,"cursorId",cursorId);
  


  let filter = {};
  let sort = {createdAt:-1};
  let projection = {};//projection is which fields are going to return from mongodb.

  if(q){
    filter.$text = {$search:q};
    projection.score ={$meta:"textScore"};
    sort = {score:{$meta:"textScore"}};
  };

  if(cursorId){
    filter._id = {$lt:new mongoose.Types.ObjectId(cursorId)};
  }

  const blogs = await blogDetailSchema.find(filter,projection).sort(sort).limit(Number(limit));
  return blogs;
}





// $text, $search mean?
/* 
When you use:{ $text: { $search: "mongodb" } }

MongoDB internally calculates a relevance score for each document.

That score:
Is NOT stored in your document
Is NOT visible by default
Exists only during that query

To access it, you must explicitly request it using:{ score: { $meta: "textScore" } }



Projection controls which fields are returned from MongoDB.
Example:db.blogs.find({}, { title: 1, content: 1 })
This returns only:title & content

projection.score ={$meta:"textScore"} means “Add a new field called score in the result cause the score will come as a result while query time, and fill it with MongoDB’s calculated text relevance score.”

*/

  
/* 
Next filtering todoSteps-->
✅ Pagination (done)
➡ Input validation middleware
➡ Centralized error handling
➡ Response structure standardization
➡ MongoDB indexing optimization
➡ Advanced JWT auth
➡ Role-based authorization
➡ Security middleware
➡ Logging
➡ Unit testing


Advanced filtering like:
?age[gte]=20&age[lte]=40

Sorting dynamic:
?sort=createdAt,-age

Production-grade search engine pattern
Preventing MongoDB injection
Multi-field cursor pagination


key    value
sort   -createdAt,updatedAt
blogtitle title
isPub..  true/false
cusorId  schemaid



const sortFieldsDirect = sortOption[firstSortField] ?? 1;
Why ?? 1 ?
Nullish coalescing operator:

undefined ?? 1  → 1
null ?? 1       → 1
-1 ?? 1         → -1
So if value exists → keep it
If undefined → default to 1

*/



export const toggleLikeBlog = async(userId, blogId)=>{
//if user allready like then blogIndex will throw the error,but it can not delte the same exist  user

const existingLike = await blogLikeModel.findOneAndDelete({
  userId,blogId
});//doc not find then return null

if(existingLike){
  return {
    message:"like removed",
    liked:false};
}

await blogLikeModel.create({
    userId,
    blogId,
  });
  return {
    message:"like added",
    liked:true};

}

/* 

1.Database Constraint + Service-Level Error Translation
MongoDB throws:
E11000 duplicate key error
Service translates it into:
"You already liked this blog"
Controller translates that into:
HTTP 409 Conflict
That’s a 3-layer transformation.



2.reasons of service layer trycatch
Handles DB-specific logic
Hides MongoDB internals
Throws clean application error
------------------------------
reasons of controller layer trycatch
Translate business errors → HTTP response

3.


*/



//comment and reply
export const commentBlog = async (userId,blogId,commentText,parentCommentId=null)=>{

if(!Types.ObjectId.isValid(blogId)) throw new Error("Invalid blogId");
if(parentCommentId && !Types.ObjectId.isValid(parentCommentId))throw new Error("Invalid parentCommentId");

const trimComment = commentText?.trim();
if(!trimComment || trimComment.length === 0) throw new Error("comment cannot be empty");

if(trimComment.length > 200){
  throw  new Error("Maximum comment length is 200 characters");
}

const blogExist = await blogDetailSchema.findById(blogId);
if(!blogExist) throw new Error (`blog not exist on this blogId${blogId}`);//"Blog not found"


   if(parentCommentId){
  const PcomentExist = await BlogCommentModel.findById(parentCommentId);
  if(!PcomentExist) throw new Error ("parentComment not found");
  if(!PcomentExist.blogId.equals(blogId))throw new Error("Parent comment does not belong to this blog");
  //why do i need this? i allready mapped the blogId with parentComment, if that was correct then why recheck?

  if(PcomentExist.isDeleted) throw new Error("Cannot reply to a deleted comment");// i allready check it is exist or not , then how and why?is it beacause of soft delete?

   }
const comment = await BlogCommentModel.create(
  {
    userId,
    blogId,
    commentText:trimComment,
    parentCommentId,  

  });

await blogDetailSchema.findByIdAndUpdate(blogId,{
  $inc:{commentCount:1},//if field not created then it can create
});
  return comment;

   /* 
   Note->

   1.If I already mapped blogId with parentComment perfectly, why recheck?
   Because users control API input.Someone can send:
  blogId = A
  parentCommentId = commentFromBlogB
   
   
2.If I already check parent exists, why check deleted?
Because soft delete means:
Document still exists in DB
but isDeleted = true
So:
findById()
will return document even if deleted.
   
   
   
   */
}












