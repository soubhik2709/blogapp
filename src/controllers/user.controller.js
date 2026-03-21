import blogLikeModel from "../models/blogLike.js";
import blogDetailSchema from "../models/blogschema.js";
import {
  updatePassword,
  deleteUser,
  findDataPagination,
  getBlogs,
  toggleLikeBlog,
  commentBlog,
  deleteComment,
  share,
} from "../services/user.service.js";

export const updateUserPassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    const result = await updatePassword(email, oldPassword, newPassword);
    return res
      .status(200)
      .json({ message: "password updated", result: result });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "cannot update the password", error: error.message });
  }
};

export const deleteuser = async (req, res) => {
  const { password } = req.body;
  const { userId } = req.user;
  try {
    const result = await deleteUser(userId, password);
    return res.status(200).json({
      message: "user delete",
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "cannot delete user", error: error.message });
  }
};

//paginations --public
export const findData = async (req, res) => {
  const userId = req.params.userId;
  if (!userId)
    return res.status(400).json({
      message: "userId is not given",
    });

  //dynamic filterization
  const { cursorId, sort, ...filters } = req.query;

  // console.log("the nextCursorId is ",cursorId , "the filter is ",filters,"sort is ",sort);

  try {
    const result = await findDataPagination(userId, cursorId, sort, filters);

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.log("error is", error);
    res.status(400).json({
      message: "blog not found",
      error: error.message,
    });
  }
};

//search feature
export const getBlogsController = async (req, res) => {
  console.log("the req.qurey from controller", req.query.q);
  try {
    const blogs = await getBlogs(req.query);
    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//like feature
export const toggleLikeController = async (req, res) => {
  const { userId } = req.user;
  const { blogId } = req.params;
  // console.log("usrid & blog Id is ", userId, blogId);
const blog = await blogDetailSchema.findById(blogId).populate("userId");  
console.log("the blog is",blog);
  try {
    const result = await toggleLikeBlog(userId, blogId);
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

//comment and reply
export const commentBlogController = async (req, res) => {
  const { userId } = req.user;
  const { blogId } = req.params;
  const { commentText, parentCommentId } = req.body;

  // console.log("At commment controller \n BlogId",blogId,"\n commentText",commentText,"\n prentCommentId",parentCommentId);

  try {
    const result = await commentBlog(
      userId,
      blogId,
      commentText,
      parentCommentId,
    );
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//deleteComment & reply
export const deleteCommentController = async (req, res) => {
  const { userId, role } = req.user;
  const { commentId,blogId } = req.params;
  console.log(
    "At controller the \n userId is ",
    userId,
    "\n commentId is ",
    commentId,
    "\n role is ",
    role,
  );
  try {
    const result = await deleteComment(userId, role, commentId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ------ share ------
export const shareController = async (req, res) => {
  const { userId } = req.user;
  const { blogId } = req.params;
  const {sharePlatform} = req.body;
 try {

  if (!blogId) {
      return res.status(400).json({
        success: false,
        message: "Blog Id is required",
      });
    }

if(!sharePlatform || typeof sharePlatform !== "string"){
  return res.status(400).json({
    success:false,
    message:"Valid share platform is required",
  });
}

    const result = await share(userId, blogId, sharePlatform);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(409).json({
      success: false,
      message: error.message,
    });
  }

  /* 
  learn and fix about this-->
  If malicious user sends:
{
  "sharePlatform": { "$ne": null }
}
What will happen? 

can be done in better error handling
    // 5️⃣ Duplicate share (Conflict)
    if (error.message.includes("already shared")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    // 6️⃣ Blog not found
    if (error.message.includes("Blog not Exist")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // 7️⃣ Default error
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }



*/
};

