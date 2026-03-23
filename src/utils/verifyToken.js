// utils/verifyToken.js
import jwt from "jsonwebtoken";

export function verifyAccessToken(token){
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
};

export function verifyRefreshToken(token){
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY);
};

