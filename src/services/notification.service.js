//services/notification.service.js
import { NotificationModel } from "../models/notification.model.js";
import { redisClient } from "../config/redis.js";
// import emailQueue from ""
import blogPeopleSchema from "../models/blogPeopleSchema.js";

export const sendNotification = async ({recipientId,senderId,type,blogId,blogTitle})=>{

    //message String
    const sender = await blogPeopleSchema.findById(senderId).select("name");
    const messageMap = {
    Like:`${sender.name} Liked on your post "${blogTitle}"`,
    Comment: `${sender.name} comment on your post "${blogTitle}"`,
    Share: `${sender.name} shared your post "${blogTitle}"`,
    }

    const  message = messageMap[type];
    console.log("the messageMap is",message);
   
    // save to DB
    const notification  = await NotificationModel.create({
        recipient:recipientId,
        sender:senderId,
        type,
        blog:blogId,
        message,
        read:false,
    });

    //check if recipient is online or not 
    const isOnline = await redisClient.get(`online:${recipientId}`);
    if(isOnline){
        // Then send noti via redis Pub/Sub -> WebSocket
        await redisClient.publish(
            `notify:${recipientId}`,
            JSON.stringify({
                type:"new_notification",
                notification:notification._id,
                message,
                notifyType:type,
                blogId,
                createdAt:notification.createdAt,
            })//in my subscribe , i only take the message as argument so why this much detials has send to the subscribe?
        );


    }else{
        // offline:queue an email
        const recipient = await blogPeopleSchema.findById(recipientId).select("email name");//why two parameter is given in select? why select is use despite of findbyId

        await emailQueue.add({
            to:recipient.email,
            subject:`New notification on BlogApp`,
            html:
    `   <p>Hi ${recipient.name},</p>
        <p>${message}</p>
        <p><a href="${process.env.CLIENT_URL}/blog/${blogId}">View post</a></p> `,

        },{
            attempts:3, //if fails then 3 times retry
            backoff:5000, //wait 5s between retires
        }  
    );
    }

}