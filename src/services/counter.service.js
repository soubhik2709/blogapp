//counter.service.js

import { redisClient } from "../config/redis.js"


//This function will use for the count of share, like , commentCount.
export const getOrInitCounter = async (key,dbCallback)=>{
    console.log("im in ! getOrInitCounter  block");

    let value = await redisClient.get(key);

    if(value === null){
        console.log("cahce  Miss ❌");
        const countFromDB = await dbCallback();
        await redisClient.set(key,countFromDB,{EX:600});
        value= countFromDB;
    }
    return Number(value);
}
//why this name - getOrInitCounter?
