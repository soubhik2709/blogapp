const {blogperson} = require("../models/user");
const bcrypt = require("bcryptjs");

const signupUser = async(name,email,pasword)=>{
const userExist = await userDetailSchema.findOne({ email });
 if (userExist) throw new Error("User is already exist");
 const hashedPassword = await bcrypt.hash(password,10);// how to add salt here, do i need this?
 return blogperson.create({
    name,
    email,
    password:hashedPassword,
 })
}

const loginUser = async(email,password)=>{
const userExist = await blogperson.findOne({email});
if(!userExist) throw new Error("User is not exist");
const validPassword = await bcrypt.compare(password, userExist.password);
if(!validPassword) throw new Error("Invalid Password");
return userExist;
}

module.exports= {signupUser, loginUser}

//how many things are there present in this module?
