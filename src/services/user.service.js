const blogPerson = require("../models/user");
const bcrypt = require("bcryptjs");

const updatePassword = async (email, oldPassword, newPassword) => {
  const userExist = await blogPerson.findOne({ email });
  if (!userExist) throw new Error("Your mail is wrong");
  const vlaidPassword = await bcrypt.compare(oldPassword, userExist.password);
  if (!vlaidPassword) throw new Error("Old Password is not Matching");
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  userExist.password = hashedPassword;
  await userExist.save();
  return userExist;
};

const deleteUser = async (userId, password) => {
  const userExist = await blogPerson.findById(userId); //is it get from userid from middleware
  if (!userExist) throw new Error("User Not Found");
  const isMatch = await bcrypt.compare(password, userExist.password);
  if (!isMatch) throw new Error("Password is incorrect");
  await userExist.deleteOne();
  return true;
};

module.exports = { updatePassword, deleteUser };

//make forgetpassword, verifyemail,
