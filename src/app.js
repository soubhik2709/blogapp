const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

//middlewares for parsing data
app.use(express.json());//use of this with cookieParser
app.use(cookieParser());//use of this
app.use(express.urlencoded({extended:false}));//use of this?

//routes folders
const blogRoutes = require("./routes/blog.router")
const userRoutes = require("./routes/user.router")

//routes redirect
app.use("/api/users/blog",blogRoutes);
app.use("/api/users/auth",userRoutes);


module.exports = app;