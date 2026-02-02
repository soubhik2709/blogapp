
//blogschema.js
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "blogperson",
    required: true,
  },
  blogtitle: {
    type: String,
    required: true,
    lowercase: true,  
  },
  k:{
    type: String,
    required: true,
    lowercase: true,
  },
  isPublished:{
    type:Boolean,
    default:false,
  }

},{timestamps:true});


module.exports = mongoose.models.blogschema || mongoose.model("blogschema", blogSchema);


/*
todo
blog view, like, share,comments, publish, unpublish,


*/
