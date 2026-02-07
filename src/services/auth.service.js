import blogPeopleSchema from "../models/blogPeopleSchema.js";
import bcrypt from "bcryptjs";

export const signupUser = async (name, email, password, role) => {
  const userExist = await blogPeopleSchema.findOne({ email });
  if (userExist) throw new Error("User is already exist");

  const hashedPassword = await bcrypt.hash(password, 10); // how to add salt here, do i need this?

  const user = await blogPeopleSchema.create({
    name,
    email,
    password: hashedPassword,
    role,
  });



  return user;
};

export const loginUser = async (email, password) => {
  const userExist = await blogPeopleSchema.findOne({ email });
  if (!userExist) throw new Error("User is not exist, Invalid Email");

  const validPassword = await bcrypt.compare(password, userExist.password); //it returns true or false
  if (!validPassword) throw new Error("Invalid Password");
  //console.log("validpassword from login service is",validPassword);
  return userExist;
};



//how many things are there present in this module?

/* 
case 1.Login succeeded, refresh token saved, cookie set, then error occurs. Error happens AFTER tokens are created.
Refresh token already exists in DB
Cookie already exists in browser
Access token may or may not reach client


case 2.: User logs in AGAIN
allready have accs and refrsh Token
Every login:
new refresh token created
old refresh tokens remain in DB


==>The common Solutions is
User logs in
1.Delete all existing refresh tokens for that user
2.Create ONE new refresh token
3.Each login = one refresh token so Each token linked to:
     .device
     .browser
     .IP
     evice: "Chrome on Windows",//use this steps later
4. Any Others steps to took?

so the Flow will be after that ------->
New login:
old refresh tokens deleted
new refresh token created
cookie overwritten
AcceessToken is not deleted.if old accessToken not expires then it will stays otherwise after expires then  the new access token regenerated.



-->is there any others cases of problem possible?

Killing refresh tokens = killing sessions
Not killing access tokens = performance + simplicity


as the resfresh token is sent through cookies so it is save the post man and postmant automatic send the this cookies with every request, but for protected route i have to add the accessToken manually 


Next Todo-->
Refresh token rotation
Token versioning
Rate limiting login
Account lock after failed attempts
Email verification enforcement
*/
