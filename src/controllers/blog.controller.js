const {
  blogSavetoDB,
  showAllBlog,
  blogUpdatefromDB,
} = require("../services/blog.service");

exports.saveBlogs = async (req, res) => {
  console.log("request from backend for saveBlog is", req.body);
  const { userId, blogtitle, blogContent } = req.body; //here the userId is coming from json , what to do?
  try {
    const result = await blogSavetoDB(userId, blogtitle, blogContent);
    res.status(201).json({ message: "Blog saved", result });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Blog  Failed to saved", message: error.message });
  }
};

exports.showBlogs = async (req, res) => {
  try {
    const id = req.user.id;
    // console.log("user id is",id);
    const result = await showAllBlog(id);
    res.status(201).json({ message: "Blog is", result });
  } catch (error) {
    res
      .status(500) //did we use 500 for fetching error?
      .json({ error: "Blog  Failed to show", message: error.message });
  }
};

exports.updateBlogs = async (req, res) => {
  const { blogtitle, blogContent } = req.body;
  try {
    const id = req.user.id;
    const result = await blogUpdatefromDB(id, blogContent, blogtitle);
    res.status(201).json({ message: "Blog is updated", result });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Blog Failed to update", message: error.message });
  }
};

/*
exports.deleteBlogs = async (req, res) => {
  try {
  } catch (error) {}
};
 */
