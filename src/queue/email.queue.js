// queues/email.queue.js
import Bull from "bull";
import {sendEmail} from "../helper/email.service.js";
// Bull uses Redis internally  to persist jobs, if server restart , queued emails are not lost
export const emailQueue = new Bull("email",{
    redis:process.env.REDIS_URL
});//what this line do? 1

// This is the worker - it processes one job at a time
emailQueue.process(async (job)=>{//what is process?
    const{to,subject,html} = job.data;
    await sendEmail({to,subject,html});
    });

emailQueue.on("completed",(job)=>{
    console.log(`Email sent to ${job.data.to}`);
});

emailQueue.on("failed",(job,err)=>{
    console.log(`Email failed for ${job.data.to}:`, err);
});




/* 
if  we dont use the bull package , only use the redis , then we have to manually handle this situation .But for bull , it handle redis internally
 *  Features:
 *  1. Basic Queue          — queue.add() + queue.process()
 *  2. Auto Retry           — { attempts: N }
 *  3. Delayed Jobs         — { delay: ms }
 *  4. Scheduled/Cron Jobs  — { repeat: { cron: "..." } }
 *  5. Job Priority         — { priority: N }
 *  6. Job Progress         — job.progress(percent)
 *  7. Failed Job History   — queue.getFailed()
 *  8. Crash Recovery       — automatic (Bull manages job states)
 *  9. Dashboard/Monitoring — Bull Board UI + queue.getJobCounts()

-------------------------------------------------
full feature by using BUll
--------------------------------------------------
1.// queue/email.queue.js
export const emailQueue = new Bull("email", {
  redis: process.env.REDIS_URL
});
```

Bull immediately connects to Redis and creates its own internal tracking keys. You will see something like:
```
"bull:email:id"  →  "0"
```

Or a set of keys like:
```
bull:email:id
bull:email:active
bull:email:wait
bull:email:completed
bull:email:failed
bull:email:delayed
bull:email:paused
```

---

## What each key means
```
bull:email:id          → counter — tracks the ID of the next job
                         starts at 0, increments each time you add a job

bull:email:active      → list of jobs currently being processed

bull:email:wait        → list of jobs waiting to be processed

bull:email:completed   → list of finished jobs

bull:email:failed      → list of jobs that failed after all retries

bull:email:delayed     → list of jobs scheduled for future

bull:email:paused      → whether the queue is paused
```

---

## Why Bull does this automatically

Bull uses Redis as its database to store job state. This is actually one of Bull's biggest features — if your server crashes mid-job, when it restarts Bull reads these keys and knows exactly which jobs were in progress and picks up from where it left off. No jobs are lost.

Think of it as Bull's own internal bookkeeping system living inside your Redis instance alongside your own keys.

---

## Your Redis keys at this point should look like
```
bull:email:id          ← Bull's internal counter
online:userId          ← your presence tracking (when WS connects)
ws_ticket:xxxxx        ← your WS ticket (when someone requests one)
blog:blogId            ← your blog cache

*/

