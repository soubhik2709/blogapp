// wsServer.js(Upgrade handler)
import { WebSocketServer } from "ws";
import { authenticateWebSocket } from "./wsAuth.js";
import { wsManager } from "./wsManager.js";
import { redisClient } from "../config/redis.js";

export function initializeWebSocket(server){
    const wss = new WebSocketServer({noServer:true});
    console.log("all the wss clients",wss.clients);

//heartBeat Interval 
//checks every connected client
// if a client did not respond to last ping → connection is dead → terminate
const heartBeat = setInterval(()=>{
wss.clients.forEach((ws)=>{
    if(!ws.isAlive){
        // did not respond to ping sent 30s ago — connection is silently dead
        // terminate() forces close which triggers ws.on("close") below
        // that handler cleans up Redis and wsManager
        ws.terminate();
        return;   
    }
    // this bleow statement  only run if the if block was NOT entered
    ws.isAlive = false;
    ws.ping();
})
},30000);//30s

  // stop the interval when the WSS server itself closes
  // otherwise the interval keeps running forever even after server shutdown
wss.on("close",()=>{
    clearInterval(heartBeat);
});




// handle upgrade ---
    server.on("upgrade",async(req,socket,head,)=>{
        try {
        const authResult = await authenticateWebSocket(req);

       if(!authResult.success){
         socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');//what is the mean of this line? 3.
        socket.destroy();
        return;
       }
      console.log("the autheticate is at wsServer.js",authResult);

       wss.handleUpgrade(req,socket,head,(ws)=>{
        ws.user=authResult.user;

        wss.emit("connection",ws,req);
       });
        } catch (error) {
            // unexpected during upgrade
            console.log("ws upgrage error:",error);
            socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
            socket.destroy();
        }

    });


    // --- connection establish

    wss.on("connection",async(ws)=>{
        console.log("user connected:",ws.user.id);
        console.log("The WS is:",ws);
        const userId = ws.user.id;


        //mark conection alive for heartbeat track
        ws.isAlive = true;
        ws.on("pong",()=>{
            ws.isAlive = true;
        });

        // Mark User Online---
        wsManager.adduser(userId,ws);//IT will store at onlineUser as ws obj.

        //set user online on Redis
        await redisClient.set( `online:${userId}`,"1",{EX:86400});//Timing is for incase saftey expiry,incase user disconnect and never fires.

        console.log(`User ${userId} is now online`);

        // subscribe to user's notification chanel
    // When another server instance publishes to this channel,then this handler will fire and deliver it over WebSocket
    const subscriber = redisClient.duplicate();//create duplicate TCP
    await subscriber.connect();//connect duplicate TCP for geting the data

     // notification.service.js publishes here when someone interacts with their content
    await subscriber.subscribe(`notify:${userId}`,(message)=>{
        if(ws.readyState === ws.OPEN){
            ws.send(message);//msg is allready in JSON
        }
    });//1


    //Incoming message from browser---

        ws.on("message",(msg)=>{
            console.log("Message from ",ws.user.id,msg.toString());
        });
        ws.on("close", async()=>{
            // Mark User offline
            wsManager.removedUser(userId);
            await redisClient.del(`online:${userId}`);
            await subscriber.unsubscribe(`notify:${userId}`);//2
            await subscriber.disconnect();//why this is linethrough?

            console.log("User disconnected:",ws.user.id);
        });
        ws.on("error",(err)=>{
            console.error(`ws error for user ${ws.user.id}:`,err);
        });
    });
    return wss;
}






/* 
1.WebSocket Server :
Frist time Login then getting access,refresh Token. Then if browser req for upgrade to websocket 
The req is look like this-->

GET /ws?ticket=abc123 HTTP/1.1
Host: yourdomain.com
Upgrade: websocket
Connection: Upgrade

Then first req the  sever give one ticket .
Then second req , we get ticket for 30s validation and store on redis and one time access then ticket will distroy. IF correct Ticket then http upgrade to ws. Now duplex connection establish for the ws connection. but the normal post, signup , comment, getBlog etc request is work on the same http only. 


if webSocket server is created by server i.e. webSocketSever({server}) then it automatically handle the upgrade status. We dont have to create server.on("upgrade") function.Cause it handle automatically.

But we want to  check the ticket(authenticate user) then only we will upgrade to the ws from http. so thats why need controll in our hand so we will use WebSocketServer({ noServer: true }).This means that i will create server. And handle the  upgradation  of the result by own.


we use ticket cause we cant send the headers from browser with manually like this Authorization: Bearer token .
--------------------------------------------------------------------

2. differnece between this two -->
    server.on("upgrade",async(req,socket,head,)=>{ &  wss.handleUpgrade(req,socket,head,(ws)=>{
ans:
They are two different layers of the same process
Step 1: server.on("upgrade", ...)
server.on("upgrade", (req, socket, head) => {})

👉 This is Node.js HTTP server level

📌 When it runs:

When client sends:

Upgrade: websocket
📦 Parameters explained
1. req (IncomingMessage)

Contains:

URL (/ws?ticket=abc)

headers

cookies

👉 You use this for:

auth

parsing query params

2. socket (net.Socket)

Raw TCP connection

👉 You use this for:

accepting or rejecting connection

writing manual response

Example:

socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
socket.destroy();
3. head (Buffer)

Remaining data from request (rarely used)

👉 Usually:

just pass it to handleUpgrade

🔹 Step 2: wss.handleUpgrade(...)
wss.handleUpgrade(req, socket, head, (ws) => {})

👉 This is WebSocket library (ws) level

📌 What it does:

Validates WebSocket handshake

Converts HTTP → WebSocket

Creates ws object

📦 Parameters explained
1. req

Same request object (passed forward)

2. socket

Same TCP connection (reused)

3. head

Same buffer (forwarded)

4. (ws) => {}

👉 Callback after successful upgrade

🔥 Inside this callback:
ws (WebSocket instance)

Now this is real WebSocket connection

You can:

ws.send("hello");

ws.on("message", (msg) => {});
ws.on("close", () => {});
⚡ Key Difference (IMPORTANT)
Feature	server.on("upgrade")	handleUpgrade()
Level	HTTP server	WebSocket server
Purpose	Intercept request	Convert to WS
Can reject?	✅ Yes	❌ No (should already be valid)
Output	raw socket	ws object

----------------------------------------------------------
3.   socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');//what is the mean of this line?
ans:
you are manually sending an HTTP response through a raw TCP socket.
the given code is similarly this -->
socket.write(
  'HTTP/1.1 401 Unauthorized\r\n' +
  'Content-Type: text/plain\r\n' +
  '\r\n' +
  'Unauthorized'
);
socket.destroy();

What each part means
📄 "HTTP/1.1 401 Unauthorized"

HTTP/1.1 → protocol version

401 → status code (Unauthorized)

Unauthorized → status message

👉 Equivalent to:

HTTP/1.1 401 Unauthorized
🔚 \r\n\r\n

This is VERY important.

\r = carriage return

\n = new line

👉 In HTTP:

\r\n = end of one line
\r\n\r\n = end of headers (response complete)
---------------------------------------------------------


*/


/* Redis PUB sub
we know redisclinet.connect() creates a TCP connection to Redis.
now,
when im making subscriber.connect() meaning that some another tcp ws  connection is just copies the config (URL, password).and opens a brand new TCP connection.it does NOT interfere with the original client in any way.Then as a result->
subscriber → only listens
redisClient → set/get/del freely
both work at the same time

Once a Redis connection enters subscribe mode, it can do nothing else. so if you do -->
redisClient.set(...) would throw an error
redisClient.get(...) would throw an error
your whole app breaks.
 So you need a second dedicated connection just for listening.

--------------------------------------
doubt:
1.what is this function does?
    await subscriber.subscribe(`notify:${userId}`,(message)=>{
        if(ws.readyState === ws.OPEN){
            ws.send(message);//msg is allready in JSON
        }
    });//what is subscriber.subscribe?
ans:
What is subscriber?
It's a Redis client that is in "listening mode". Its a copy of redis, used only for subscribing.You need a separate Redis client for subscribing because once a client starts subscribing, it can only listen — it can't do anything else.

What is the channel name — notify:${userId}?
javascript`notify:${userId}`
// if userId = 42, this becomes → "notify:42"
// if userId = 99, this becomes → "notify:99"
```
Every user gets their **own private channel**."notify:42"  →  only messages for User 42.
### The full flow visualized:
```
Someone publishes a message
        |
        ▼
  Redis Channel
  "notify:42"
        |
        ▼
subscriber.subscribe() receives it
        |
        ▼
callback fires → (message) => { ... }
        |
        ▼
check if WebSocket is still open
  ws.readyState === ws.OPEN
        |
        ▼
ws.send(message) → delivered to browser ✅

2.what is  subscriber.disconnect();  subscriber.unsubscribe(`notify:42`) do?
`subscriber.unsubscribe("notify:42")`
This tells Redis:
> **"Stop sending me messages from channel notify:42"**
```
Before unsubscribe:
Redis "notify:42" ──────────────► subscriber (listening) ✅

After unsubscribe:
Redis "notify:42" ──────────────► subscriber (ignores it) 🚫
```
Think of it like **changing the radio frequency** — you're no longer tuned in.

### `subscriber.disconnect()`
This **completely closes** the connection between your server and Redis.

3.

----------------------------------------
Why duplicate instead of using main client
Once subscribed, a Redis connection can do nothing else — all other commands throw errors
What is Pub/Sub
Publisher sends to a named channel, all subscribers to that channel receive it instantly
What if nobody is subscribed
Message is lost forever — Redis Pub/Sub has no storage
Why also save to MongoDB
Because Pub/Sub only works for users online right now

*/