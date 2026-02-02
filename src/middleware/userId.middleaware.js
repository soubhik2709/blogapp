//if id is correct , user is verified, blogperson is user not admin then this middleware is using.

const blogSchema = require("../models/blogschema");
module.exports = async(req, res, next) => {
  console.log("userId validation middleware is start running ✅");
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      error: "userId is required",
    });
  }
  userid = userId.trim();
  req.user = {
    id: userId,
  };
  next();
};
//why params not req.query?

 
  // const result = await blogSchema.findOne({userId});
  // console.log("the result in middleware is ",result)

