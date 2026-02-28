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


1.How Redis hanlde like share comment count , no  more field require?

as im using redis so the commentCount,likecount,sharecount not have to be keep as a field inside the blogschema,cause if users made like , comment , or share then new doc will create and all the docuements are saved inside the DB. then after when that blog is request , the first time for showing the count of all these fields  have been   calculte,then it will store as a cache in Redis. Then any like happen then redis will increment on memory, and show on the page directly.Incase redis restart ,then not a problem cause all new like ,share etc doc are save in db , so redis will handle by my application logic where the count system allready calculate and show on page , then Redis handles future increments.

2.what is this in mongoDb API Orchestration?
*/
