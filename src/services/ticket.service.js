//ticket.service.js(central ticket Logic)
import { redisClient } from "../config/redis.js";
import crypto from "crypto";

export const createTicket = async (userId)=>{
    const ticket = crypto.randomUUID();
    await redisClient.set(`ws_ticket:${ticket}`,userId,{EX:30});
    return ticket;
};


export const verifyTicket = async(ticket)=>{
    const userId = await redisClient.getDel(`ws_ticket:${ticket}`);   
    return userId ?? null;
};//we cant use the get then del as two separate operations. Between those two calls, another request could use the same ticket.