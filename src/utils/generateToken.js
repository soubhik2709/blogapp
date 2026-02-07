import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId }, // ✅ consistent
    process.env.JWT_ACCESS_SECRET_KEY,
    { expiresIn: "4d" } // ✅ valid
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET_KEY,
    { expiresIn: "4d" }
  );
};

export const generateMailVerifyToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "10m" }
  );
};
