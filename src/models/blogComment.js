//BlogComment.js
import mongoose from "mongoose";

const BlogCommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blogpeople",
      required: true,
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blogschema",
      required: true,
    },
    commentText: {
      type: String,
      maxlength: 200,
      required: true,
      trim: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "blogcomment",
      default: null,
    }, //use for nested comment

    isDeleted: {
      type: Boolean,
      default: false,
    },//soft delete.

  },
  { timestamps: true },
);

// index for first blog comments fetching
BlogCommentSchema.index({ blogId: 1, parentCommentId: 1, createdAt: -1 }); //why parentCommentId: 1 not -1? but all the others are -1?and why do i need to write parentCommentId?

BlogCommentSchema.index({parentCommentId:1,createdAt:1});
//how to know who mapped whom ?

const BlogCommentModel =
  mongoose.models.blogcomment ||
  mongoose.model("blogcomment", BlogCommentSchema);

export default BlogCommentModel;




/* 
1.do i need this blogCommentIndexing? 
yes ,but not need to make unique cause one user can make multiple times of comments.
we need indexing cause
A blog can have 10,000 comments.
Without index → MongoDB scans full collection.
With index → It directly jumps to matching blogId rows.


2. Why parentCommentId Is Needed in the firstIndexing ,cause only by blogId i can get all the comments,

Ans :all of them are get mixed, all of them are get unorder,which one is whose reply dont know ,which one is whose parents dont know.
Because parentCommentId tells you:

👉 Is this comment top-level?
👉 Or is it a reply?
👉 If reply, reply to whom?

Without it, you cannot build nesting.

------------Todo--------------------------------------
⚠️ Small Improvement Suggestion (Important)

Since you have isDeleted, most queries will likely include:

isDeleted: false


If that’s true, then your real queries will look like:

find({
  blogId,
  parentCommentId: null,
  isDeleted: false
})


In that case, for maximum performance, you may later consider:

{ blogId: 1, parentCommentId: 1, isDeleted: 1, createdAt: -1 }


But this is optional for now.


*/
