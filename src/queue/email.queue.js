// queues/email.queue.js
import Bull from "bull";
// import snedmail 

// Bull uses Redis internally  to persist jobs, if server restart , queued emails are not lost
export const emailQueue = new Bull("email",{
    redis:process.env.REDIS_URL
});//what this line do?

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


*/

