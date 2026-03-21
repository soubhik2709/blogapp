// auth.middleware.js

import { authenticateUserFromToken } from "../utils/authenticateUser.js";

const authMiddleware = async (req, res, next) => {
 
  try {
  console.log("auth middleware start Running✅");
  
  const authHeader = req.headers.authorization;
  // console.log("auth header", authHeader);

  if (!authHeader|| !authHeader.startsWith("Bearer ")) return res.status(401).json({ message:  "Unauthorized: No token"});

  const Token = authHeader.split(" ")[1];
  
    req.user = await authenticateUserFromToken(Token);
  //  i didnt return the req so how routes and other middleware  will take the req value from here?
    next();

  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or Unauthorize  or expired Access Token", error: error });
  }
};
export default authMiddleware;






/* 



this middleware is doing-->
took the accessToken  then verify the token then check user is persent in the database or not then check user is verified or not return user id and role.




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
