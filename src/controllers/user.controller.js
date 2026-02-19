import {
  updatePassword,
  deleteUser,
  findDataPagination,
  getBlogs,
  toggleLikeBlog,
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
  const {userId}=req.user;
  const {blogId} = req.params;
  console.log("usrid & blog Id is ",userId, blogId);

  try {

    const result = await toggleLikeBlog(userId, blogId);
    return res.status(201).json({
      success:true,
      data:result,
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
