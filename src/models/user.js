// User can like , sh, com

const mongoose = require("mongoose");

const blogPerson = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.blogperson || mongoose.model("blogperson", blogPerson);

/*   
  Todo -->
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,
  



  
  Doubt->
  1.how should i use isverified for persons for both user and Admin
  2.here i make role feature , so same schema but different role. or should i make different admin schema?what is this every feature call ? like name, role, email:

  3.
  
  
  
  */
