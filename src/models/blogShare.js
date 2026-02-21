//BlogShare.js
import mongoose from "mongoose";
const BlogShareSchema = new mongoose.Schema(
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
    sharePlatform : {
      type: String,
      required: true,
      trim: true,
      lowercase:true,
    },
  },
  { timestamps: true },
);

//indexing for searching the blogs. One share per platform
BlogShareSchema.index({blogId:1,userId:1,sharePlatform:1},{unique:true});

const BlogSharetModel =  mongoose.models.blogshare ||  mongoose.model("blogshare", BlogShareSchema);

export default BlogSharetModel;



/* 

Note---------------------------------------
1.
👉 One user can share same blog multiple times
👉 Multiple users can share same blog
👉 Share is an event (not a toggle like Like)

2.show me how the indexing will conceptually looks here like mapping with this paramters ?
{
  "user1_blog1235_whatsapp" : reference_to_doc1,
  "user1_blog1553_twitter"  : reference_to_doc2,
  "user2_blog1434_whatsapp" : reference_to_doc3
}
if user1 + blog1 + whatsapp try this then ❌ Duplicate error.

3.what is non-restrictive mean here?what will happen if i use createdAt  as index?BlogShareSchema.index({blogId:1,userId:1,createdAt:-1},{unique:true}); in here? 

Ans : My Goal is : One user can share link one platform only.
The unique constraint will NOT actually prevent duplicates.It looks restrictive, but in reality it won’t block repeated shares.Means if i use createdAt then if same users shares link on the same platform multiple time it will still make the unique as time is always unique so It does not restrict anything.

It only helps sorting
It improves performance for "latest shares"
It does NOT affect restriction

4.Why Order (1 or -1) Doesn’t Matter in Unique Index?
Ans: The order in which values are stored in the index tree does NOT change uniqueness logic.when i create this { blogId: 1, userId: 1, sharePlatform: 1 }{ unique: true } then No two documents can have the same combination of those fields.For equality comparison, order does not matter.

5.when this order (1 or -1) matters?
Ans:
1️⃣ Sorting queries
if i do sort({ createdAt: -1 }) then find sort in descending ,MongoDB can still use it,
but sometimes less efficiently for compound cases.

2️⃣ Range Queries :find({ createdAt: { $gt: someDate } })
Direction can influence performance.
But still —
it does NOT affect uniqueness.

2️⃣ Compound index + sorting
{ blogId: 1, createdAt: -1 }
First sort by blogId ascending
Then within each blog, sort by createdAt descending
blog1 → newest to oldest
blog2 → newest to oldest
blog3 → newest to oldest

If you run:find({ blogId: X }).sort({ createdAt: -1 })
Perfect match.MongoDB:
Finds blogId group.Already sorted by createdAt desc.Returns instantly.Very efficient.

If you run:find({ blogId: X }).sort({ createdAt: 1 })
Now problem:Index stores createdAt descending.You want ascending
MongoDB might:Use index partially,Or do extra in-memory sort,Not always terrible,
but less optimal.



doubt----------------------------------------------------
1.why it is matter to define the index fields property explicitly?





Todo----------------------------------------------------
1. Model C — One Share Per Time Window (Advanced)
User can share again after 24 hours.
This requires time-based logic.
(Advanced level — skip for now.)

2.




The order matters when

2️⃣ Range Queries

*/