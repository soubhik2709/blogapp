//BlogLike
import mongoose from "mongoose";

const BlogLikeSchema = new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'blogpeople',
            required:true,
        },
         blogId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'blogschema',
            required:true,
        },

    },{timestamps:true}
);

 BlogLikeSchema.index({userId:1,blogId:1},{unique:true});//Prevent the same user from liking the same blog twice.

const blogLikeModel = mongoose.models.blogLike || mongoose.model("blogLike",BlogLikeSchema);
export default blogLikeModel;








/* 
Note->

1.when any login user like then this document will create for particular blog,when user remove that like then this document will deleted for that blog related to that user.


2.based on this line
{ userId: 1, blogId: 1 }, { unique: true }
 when user click , the service does insertOne({ userId, blogId }).
Now MongoDB internally does this:
1️⃣ Before inserting
2️⃣ It checks the unique compound index
3️⃣ If (userId, blogId) already exists in index
4️⃣ It throws duplicate key error


3.why not can be done ?
        like: {
           type:Boolean,
           required:true, 
        }//This make api request and user can like multiple times



4. BlogLikeSchema.index({userId:1,blogId:1},{unique:true});This created in the background:

let say->
Doc1:{ _id: 101, userId: A, blogId: X } when user A click blog X then this doc created with _id 1

BlogLikeSchema.index({ userId: 1, blogId: 1 }, { unique: true })
Mongo builds a separate internal structure (B-tree index).

Conceptually it looks like:

Index Table (NOT actual table, just concept)

Key (userId, blogId)     →    _id
---------------------------------------
(A, X)                   →    101
(B, X)                   →    102
(C, Y)                   →    103
This is the “pointer”.

The pointer is _id.



*/