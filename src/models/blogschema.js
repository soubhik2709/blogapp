
//blogschema.js

import mongoose from "mongoose";
const blogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "blogpeople",
    required: true,
  },
  blogtitle: {
    type: String,
    required: true,
    lowercase: true,  
  },
  blogContent:{
    type: String,
    required: true,
    lowercase: true,
  },
  isPublished:{
    type:Boolean,
    default:false,
  }

},{timestamps:true});

const blogDetailSchema = mongoose.models.blogschema || mongoose.model("blogschema", blogSchema);

export default blogDetailSchema;


/*
todo
blog view, like, share,comments, publish, unpublish,


*/
