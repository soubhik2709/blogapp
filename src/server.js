//server.js
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import connectRedis from "./config/redis.js";
import { initializeWebSocket } from "./websocket/wsServer.js";

//connect the server
(async () => {
  try {
    await connectDB();
    await connectRedis();

    //websocket
    const server = http.createServer(app);
    initializeWebSocket(server); //1

    server.listen(process.env.PORT, () => {
      console.log(`server stated on PORT${process.env.PORT}`);
    });
  } catch (error) {
    console.log("startUp error :", error);
    process.exit(1);
  }
})();

/* 
so authmiddleware ,blogmiddleware will run when rest request run,for  every setting path . But for the ws setting for the first time as ws dont have res, or next we use separattion resuslabe code,

---------------------------------------------
1.This is call a function and we know that , the rest line will run after this function return the value. even here is no async is use so tell me how this is working?

ans:
Your code
const server = http.createServer(app);

initializeWebSocket(server);

And your doubt:

“Next line runs after function returns… but no async… how is this working?”

🔥 First truth (VERY IMPORTANT)

👉 initializeWebSocket(server) does NOT start WebSocket immediately

👉 It only registers event listeners

⚡ What actually happens step by step
🟢 Step 1: Create HTTP server
const server = http.createServer(app);

👉 This just creates a server object
👉 It does NOT start listening yet

🟢 Step 2: Call your function
initializeWebSocket(server);

👉 This runs immediately (synchronous)

🟢 Inside your function
function initializeWebSocket(server) {
  server.on("upgrade", (req, socket, head) => {
    console.log("WebSocket request came!");
  });
}

👉 What this does:

Registers a callback

DOES NOT execute it now ❌

🧠 Important concept
👉 server.on(...) = “Hey Node, when this happens later, run this”

It’s like:

"Whenever upgrade event happens in future → run this function"
---------------------------------------------
2.
*/
