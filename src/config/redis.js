//redis.js
import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Runtime error handler
redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

// Optional lifecycle logs
redisClient.on("connect", () => {
  console.log("Connecting to Redis...");
});

redisClient.on("ready", () => {
  console.log("Redis Ready");
});

redisClient.on("reconnecting", () => {
  console.log("Reconnecting to Redis...");
});

export default async function connectRedis() {
  try {
    await redisClient.connect(); 
    console.log("Redis Connected Successfully ✅");
  } catch (err) {
    console.error("Redis Connection Failed:", err);
    process.exit(1);
  }
}



/* 
Doubt-->
1.what is cache-Aside ?
2.what is this related to cache:🧠 Other Caching Strategies (For Understanding) 
Strategy	       Who updates cache?
Cache-Aside	     Application
Write-Through	   App writes to cache AND DB
Write-Behind	   Cache updates DB later
Read-Through	   Cache automatically fetches DB

Note-->
createClient() → function used to create a Redis connection instance.
createClient() = “Create a connection object that talks to Redis server”.

Redis client can emit events like:
"connect"
"ready"
"error"
"reconnecting"
So this code means:
“If Redis throws an error, run this function.”
Example error cases:
Redis server not running
Wrong password
Network issue
Timeout
Without this, your app might crash silently.





*/