
// auth.controller.js
import jwt from "jsonwebtoken";
import { signupUser,loginUser } from "../services/auth.service.js";
import {generateAccessToken,generateRefreshToken,generateMailVerifyToken} from "../utils/generateToken.js";
import refreshTokenSchema from "../models/refreshTokenSchema.js";
import EmailverificationTokenModel from "../models/mailverifyToken.js";
import {sendVerifyEmail} from "../helper/sendVerifyEmail.js";
import blogPeopleSchema from "../models/blogPeopleSchema.js";



//signup
export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const user = await signupUser(name, email, password, role);

    //  mail verification Process-
    const id = user._id;
    console.log("the user id is ", id);

    //   const mailVerifytoken = generateMailVerifyToken(user._id);can i do this directly?
    const mailVerifytoken = generateMailVerifyToken(id);
    console.log("the verifitoken from the sendmail  is ", mailVerifytoken);

    //token save to db
    const verifyTokenDb = await EmailverificationTokenModel.create({
      userId: user._id,
      email: email,
      token: mailVerifytoken,
      expiresAt:new Date(Date.now()+10*60*1000),//for 10 mins
    });
    if(verifyTokenDb){console.log("mail Token save to database")}

    //Token send to mail
    const sendVerifyToken = await sendVerifyEmail(name, email,mailVerifytoken);//is it correct way cause this variable is not going work anymroe

    return res
      .status(201)
      .json({ message: "  Please verify your email", user }); //im not gonna write this in message Signup successfully, although it meant that.cause the controll is now going to mailverify so to maintain the flow
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Signup Failed", message: error.message });
  }
};

//verification email
export const verifyEmail = async (req, res) => {
  console.log("verifyEmail is running");
  const { token } = req.query;
  console.log("the token from req.query is",token);

  try {
        // 1️⃣ Verify JWT signature
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );
        if(decoded)console.log("token is  verified through jwt",decoded);
    if(!decoded)console.log("token is  not verified through jwt",decoded);

    // 2️⃣ Find token in DB
    const tokenDoc = await EmailverificationTokenModel.findOne({ token });
    if(tokenDoc) console.log( "Token is find from databse" );
    if (!tokenDoc) console.log("Invalid token" );
    // 3️⃣ Check expiration
    if (tokenDoc.expiresAt.getTime < Date.now())
      return res.status(400).json({ message: "Token expired" });
     // 4️⃣ Verify user
    await blogPeopleSchema.findByIdAndUpdate(tokenDoc.userId, {
      isVerified: true,
    });
    //remove token
    const tokenDelete =await EmailverificationTokenModel.deleteOne({ _id: tokenDoc._id });
    if(tokenDelete) console.log("token is deleted from database",tokenDelete);
    return res.status(200).json({
      message: "Email Verified Successfully, and your signup is done",
    });
  } catch (error) {



     console.error("❌ Email verification failed from verify Email:", error);
    return res.status(401).json({
      message: "Something went wrong , Mail is not verified",
      error: error.message,
    });
  }
};


//login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);

    //remove old refreshToken
    await refreshTokenSchema.deleteMany({ userId: user._id });
    //when user login for 1st time nothing is there,so will it cause any effect? ->no

    //check old refreshToken is present or not
    /*     const refTokenCheckAgain = await refreshTokenSchema.findOne({
      userId: user._id,
    });
    console.log("Check any refreshToken is alive or not again......", refTokenCheckAgain); */

    //generate Tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);


    //save refToken to DB
    await refreshTokenSchema.create({
      userId: user._id,
      token: refreshToken,
      email: user.email,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", //front&back have to be same PORT
      })
      .status(200)
      .json({ accessToken });
  } catch (error) {
    console.log("Auth Login error", error);
    return res
      .status(401)
      .json({ error: "Login Failed", message: error.message });
  }
};

//Logout
export const logout = async (req, res) => {
  console.log("Logout process starting");

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken)
    return res.status(401).json({ message: "No refresh Token from logout" });

  await refreshTokenSchema.deleteOne({
    token: refreshToken,
  });

  return res
    .clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json({
      message: "Logged out successfully",
    }); //why not delete both token, whynot accessToken is deleted?usercan login using accessToken.is it the job for middleware to check the accessToken
};

//make  new AccessToken
export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token missing" });

  try {
    // 1. verify refresh token signature
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY,
    );

    // 2. check token exists in DB
    const tokenExist = await refreshTokenSchema.findOne({
      userId: decoded.userId,
      token: refreshToken,
    });

    if (!tokenExist)  console.log("Token revoked", tokenExist);

    // 3. issue new access token
    const newAccessToken = generateAccessToken(decoded.userId);
    console.log("new access Token created ", newAccessToken);

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};
//This refreshToken will call by fronend or from postman manually.

