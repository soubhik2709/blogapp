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
};//is it for the admin or use can delete this ? or is it suppose to be delete your acccount?


//make forgetpassword, 



//paginations
export const findDataPagination = async (userId, cursorId,filters) => {
  const limit = 4;

 //allowed filters 
 const allowedFilters = [
  "blogtitle",
  "isPublished",
 ];

   const query = {
   userId:new Types.ObjectId(userId),
 };

//dynamic query building
for (let [key,value] of Object.entries(filters)){
  if(!allowedFilters.includes(key))continue;

  if(key==="isPublished"){
    query[key]=value ==="true";
  }
  else if(key === "blogtitle"){
    query[key] ={
      $regex:value.trim(), //find the document which contain the this given value then trim means remove white spaces.
      $options:"i" //for Ram or ram or RAM
    };
  }
  else {
    query[key]=value;
  }
}

  // 🔹 Cursor pagination
  if (cursorId && Types.ObjectId.isValid(cursorId)) {
    query._id = { $gt: new  Types.ObjectId(cursorId)
     };
  }

// console.log("the query is ",query);

  const result = await blogDetailSchema.find(query).sort({_id:1}).limit(limit+1);
  
  const hasMore = result.length>limit;
  if(hasMore)result.pop();//pop() removes the last element.

  const cursors = result.length ? result[result.length - 1]._id: null; // next cursorId
  return {
    data: result,
    nextCursor: cursors,
    hasMore
  };
};
// tried to code in the buisness logic


/* 
Next filtering todoSteps-->
Advanced filtering like:
?age[gte]=20&age[lte]=40

Sorting dynamic:
?sort=createdAt,-age

Production-grade search engine pattern
Preventing MongoDB injection
Multi-field cursor pagination



*/