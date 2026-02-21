//blogschema.js

import mongoose from "mongoose";
const blogSchema = new mongoose.Schema(
  {
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
    blogContent: {
      type: String,
      required: true,
      lowercase: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

blogSchema.index(
  //what index mean? how mongodb stores in db?& use this ?
  {
    blogtitle: "text", //what can i write instead of text in use cases?
    blogContent: "text",
  },
  {
    weights: {
      blogtitle: 5,
      blogContent: 1,
    },
    name: "BlogTextIndex",
  },
); //how this is work? and how mongo store and use this ?

const blogDetailSchema =
  mongoose.models.blogschema || mongoose.model("blogschema", blogSchema);

export default blogDetailSchema;

/*
todo
blog view, like, share,comments, publish, unpublish,


*/
