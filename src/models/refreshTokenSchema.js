import mongoose from "mongoose";
const refreshTokenSchemaModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blogpeople",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const refreshTokenSchema =
  mongoose.models.RefreshTokenModel ||
  mongoose.model("RefreshTokenModel", refreshTokenSchemaModel);
export default refreshTokenSchema;
