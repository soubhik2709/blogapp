const blogPerson = require("../models/user");
const blogSchema = require("../models/blogschema");

const blogSavetoDB = async (id,title, content) => {
  //if blogPerson is user and if isVerified then proceed
  const blog = await blogSchema.create({
    userId:id,
    blogtitle: title,
    blogContent: content,
  });
  return blog;
};

  const showAllBlog = async (userId) => {
    //is blogPerson is user and if isVerified then proceed
    const allBlogs = await blogSchema.find({ userId }).populate("userId");
    return allBlogs;
  };

const blogUpdatefromDB =async(id,content,title)=>{
  console.log("id , title, content is",id, title,content);
 
const updatedPost = await blogSchema.findOneAndUpdate(
 {userId:id},
  {
    blogtitle:title,
    blogContent:content,
  },
  { new: true, runValidators: true }
)
console.log(updatedPost);
return updatedPost;
}

// const blogDeletefromDB =async(id)=>{

// //is blogPerson is user and if isVerified then proceed

// }

module.exports = { blogSavetoDB, showAllBlog,blogUpdatefromDB };







/* 
if blogPerson is user then he can add the blog not admin
if user is login then can verified then can add blog




Note-->
new: true: By default, Mongoose returns the document as it was before the update. Set this to true to get the modified document back.
runValidators: true: Since updates bypass the standard schema validation by default, this ensures the new data still follows your blog schema rules.


 */
