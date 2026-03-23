//controller/notification.controller.js

import { NotificationModel } from "../models/notification.model.js";

// GET /notifications
//Get last 20 notifications for the logged in user
export const getNotification = async(req,res)=>{
  const { userId } = req.user.id;
//   const { blogId } = req.params;
    try {
        const notifications = await NotificationModel.find({recipient:userId}).sort({createdAt:-1}).limit(5).populate("sender","name avatar").populate("blog","blogTitle");
      res.json({notifications});//i dont have sender, avatar, blog, what is this mean for?
        
        
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};


// GET/notifications/unread-count
//returns the number on the bell icon
export const getUnreadCount = async(req,res)=>{
  const { userId } = req.user.id;
    try {
        const count = await NotificationModel.countDocuments({
            recipient:userId,
            read:false,
        });
        res.json({count});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};

// PATCH/notifications/mark-read
// called when user Opnes the notification panel
export const markAllRead = async(req,res)=>{
  const { userId } = req.user.id;
    try {
        await NotificationModel.updateMany(
            {recipient:userId,read:false},
            {read:true}
        );
        res.json({message:"All marked as read"});
        
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};







/* 
notification.service.js  →  CREATES and DELIVERS notifications
notification.controller.js  →  READS notifications from MongoDB and sends to client
They do not call each other. They are independent. The controller does not need the service and the service does not need the controller. They just both happen to touch the same MongoDB Notification collection.

The notification.service is call by the Like , Comment,Share service.

*/