//wsManager.js

// This Map lives in memory on this server instance
// key = userId (string), value = the WebSocket socket object
const onlineUsers = new Map();

export const wsManager = {

    //call when user connects
    adduser(userId,socket){
        onlineUsers.set(String(userId),socket);//console.log(socket);
    },
      // called when user disconnects
    removedUser(userId){
        onlineUsers.delete(String(userId));
    },

    //returns the socket if user is connected to This server instance
    //doubt: but what will i do using this socket?
    getSocket(userId){
        return onlineUsers.get(String(userId));//but here userId is returning? why?
    },

    //check if user is connected here
    // doubt: what is mean by this comment?what happen if user is not connected here ? what is mean by that?
    isOnline(userId){
        return onlineUsers.has(String(userId));
    }
    
};








/*
This file is basically :
The onlineUsers stores the actual ws objects. This is live ws connections with active network pipeline (redis cant store).For my signle-server setup i actually not need this.  
so when the redis use the pubsub (  await redisClient.publish(`notify:${recipientId}`, JSON.stringify({...}));  ) then the notification will recieve at wsServer.js by using the wss.on("connection") closure. 

wsManager becomes necessary the moment you need to look up a socket from outside the connection handler.
1: You want to push a notification from a controller directly, without Pub/Sub. 
2.You want to broadcast to multiple users
3. You want to know how many users are currently online

*/