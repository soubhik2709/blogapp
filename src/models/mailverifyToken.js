// verification Token

import mongoose from "mongoose";
const emailVerificationToken = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"blogperson",
        required:true, 
    }, 
    email:{
        type:String,
        required:true,
    },//i use this for bettter readablity while using db
    token:{
        type:String,
        required:true,
    },
    expiresAt:{
        type:Date,
        required:true,
    },
});

const EmailverificationTokenModel = mongoose.models.EmailVerificationToken ||mongoose.model("EmailVerificationToken",emailVerificationToken);
export default EmailverificationTokenModel;

/* why i have to store the verifimailToken
Ans->
You save the verification token in the database so the backend can TRUST the verification link.

Expiry alone is not enough.
🧠 What problem are we actually solving?

When a user clicks:
/auth/verify-email?token=abc123

Your backend must answer three questions:
Is this token real or fake?
Which user does it belong to?
Has it already been used or expired?
Without DB storage → you cannot answer these reliably.

❌ What happens if you DON’T store it in DB?

Let’s explore the alternatives so this really clicks.

❌ Option 1: “Just trust the token in the URL”
Example:
if (tokenExistsInURL) markUserVerified();
🚨 Huge security hole:
Anyone can forge a token
Anyone can verify any email
No ownership check
No expiry enforcement

❌ Option 2: “JWT verification token only”
You might think:
“I’ll just create a JWT with 10 min expiry”

Example:
jwt.verify(token)
Problems:
You cannot invalidate it early
You cannot prevent reuse
You cannot rotate/resend safely
Token still valid even if user already verified


✅ Why saving token in DB is the correct solution
1️⃣ Token authenticity

Only tokens stored in DB are valid.
const tokenDoc = await EmailVerificationToken.findOne({ token })
No record → reject.

2️⃣ User binding
You know exactly which user this token belongs to.
tokenDoc.userId

3️⃣ One-time use
After verification:
await EmailVerificationToken.deleteOne({ token });

Token cannot be reused.
4️⃣ Expiry enforcement
Even if token exists:
if (expiresAt < Date.now()) reject

5️⃣ Resend verification
delete old token
create new one
send again

Without DB → impossible to manage cleanly.




expiry alone is insufficient
backend must verify authenticity
token must be one-time
token must map to a user
*/