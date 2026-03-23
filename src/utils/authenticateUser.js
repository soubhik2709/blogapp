// utils/authenticateUserFromToken.js
import blogPeopleSchema from "../models/blogPeopleSchema.js";
import {verifyAccessToken} from "../utils/verifyToken.js";

export async function authenticateUserFromToken(token){
    if(!token) throw new Error("No Token");

    let decoded;
    try {
        decoded = verifyAccessToken(token);
        
    } catch (error) {
         throw new Error("Invalid or expired token");
    }
   
    if(!decoded || !decoded.userId)throw new Error("Invalid token");
    
    const user = await blogPeopleSchema.findById(decoded.userId);

    if(!user) throw new Error("user not found");
    if(!user.isVerified) throw new Error("User not verified");

    return {
        id:user._id.toString(),
        role:user.role,
    }

};