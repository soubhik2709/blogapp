// auth.middleware.js
/* 
this middleware is doing-->
took the accessToken  then verify the token then check user is persent in the database or not then check user is verified or not return user id and role.
*/


import jwt from "jsonwebtoken";
import blogPeopleSchema from "../models/blogPeopleSchema.js";

const authMiddleware = async (req, res, next) => {
  console.log("auth middleware start Running✅");

  const authHeader = req.headers.authorization;
  // console.log("auth header", authHeader);

  if (!authHeader|| !authHeader.startsWith("Bearer ")) return res.status(401).json({ message:  "Unauthorized: No token"});

  const Token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
        Token, 
        process.env.JWT_ACCESS_SECRET_KEY
    );
  // console.log("DECODED TOKEN:", decoded);

    const user = await blogPeopleSchema.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }  
    // 🚫 block unverified users
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before accessing this resource",
      });
    }   
    
    req.user = { 
     userId: user._id,
     role:user.role,
     };
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or Unauthorize  or expired Access Token", error: error });
  }
};
export default authMiddleware;






/* 

here two case arise-

case 1.
refreshToken expires and accessToken also expires then user get logout
ans->
Request hits authMiddleware
jwt.verify(accessToken) ❌ fails
Backend returns 401
Frontend tries /refresh-token
Refresh token also ❌ invalid
👉 Force logout
✔️ User must login again

case2.
 accessToken  expires but refreshToken is not valid then how my refreshAccessToken function get call?
ans->
👉 Backend does NOT auto-call refreshAccessToken
⚠️ IMPORTANT RULE
Middleware should NEVER refresh tokens.
❓ Then who calls refreshAccessToken?
➡️ Frontend


Case-3
user logout , refreshToken deleted from database,but if accesssToken not expire then user can access the protected route, so how to resolve this security?

Frontend controls session
Backend only verifies tokens


*/
