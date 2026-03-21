//NotificationModel.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"blogpeople",
        required:true,
    }, // the user who RECEIVES the notification
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"blogpeople",
        required:true,
    },  // the user who triggered the action
    type:{
        type:String,
        enum:["Like","Comment", "Share"],
        required:true,
    },
    blog:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"blogschema",
        required:true,
    },
    message:{
        type:String,
        required:true,
         // e.g. "Ram comment on your post 'My first blog'"
    },
    read:{
        type:Boolean,
        default:false,
        // false = unread (shown as bold / red dot in UI)
    },
},{timestamps:true});

//do i need index for search notification fetching?

export const NotificationModel =  mongoose.models.NotificationModel|| mongoose.model("NotificationModel", notificationSchema);
