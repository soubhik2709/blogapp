import cookieParser from "cookie-parser";
import express from "express";

//importing routes folders
import authRoutes from "./routes/auth.router.js";
import userRoutes from "./routes/user.router.js";
import blogRoutes from "./routes/blog.router.js";

const app = express();

//middlewares for parsing data
app.use(express.json());//use of this with cookieParser
app.use(cookieParser());//use of this
app.use(express.urlencoded({extended:false}));//use of this?

//routes redirect
app.use("/api/auth",authRoutes);
app.use("/api/auth/users",userRoutes);
app.use("/api/users/blog",blogRoutes);


export default app;



