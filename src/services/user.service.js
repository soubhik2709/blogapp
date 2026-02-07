//src/service/user.service.js

import blogPeopleSchema from "../models/blogPeopleSchema.js";
import bcrypt from "bcryptjs"

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
