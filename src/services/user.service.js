//src/service/user.service.js

import blogPeopleSchema from "../models/blogPeopleSchema.js";
import blogDetailSchema from "../models/blogschema.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Types } from "mongoose";

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



































/* 
Next filtering todoSteps-->
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

