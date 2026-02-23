//blogOwnership.middleware.js
import blogSchema from "../models/blogschema.js";

/* 
here the middleware is doing
take the userId , role from authMiddleware, 
take the blogId from params
search the blog from the database like using blogId
allow full access to the admin
check the  blog userId as refrel and match with header acstokn userId
then allowed
*/

const blogOwnershipMiddleware = async (req, res, next) => {
  console.log("blogOwnershipMiddleware start Running ✅....");

  // user identity comes from authMiddleware
  const { userId, role } = req.user;
  const { blogId } = req.params;
  // console.log("\n userId is ",userId);
//  console.log("userId",userId,"role",role,"blogId",blogId);
  try {
    // resouce Existence
    const blogExist = await blogSchema.findById(blogId);
    if (!blogExist)
      return res.status(404).json({
        message: "blog is not Found",
      });
// console.log("blogExist is ",blogExist);
// console.log("\n blogExist userId is",blogExist.userId.toString());
    // 2️⃣ Admin override. admin have all permissions
    if (role === "admin") {
      return next();
    }

    //Ownership Check
    if (blogExist.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not allowed to modify this blog",
      });
    }
    req.blog = blogExist;

    // 4️⃣ Allow request
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Ownership validation failed",
      error: error.message,
    });
  }
};

export default blogOwnershipMiddleware;



/*
| What you validate  | How                     |
| ------------------ | ----------------------- |
| User identity      | JWT verification        |
| Resource existence | DB lookup               |
| Permission         | Ownership / role checks |
//1. The jwt authentication is done by autmiddleware.
//why params not req.query?
// const result = await blogSchema.findOne({userId});
// console.log("the result in middleware is ",result)
*/
