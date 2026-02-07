//src/utils/nodemailer.js -->is it correct folder creation 

import nodemailer from "nodemailer";

console.log("MAILER AT LOAD:", {
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
});

export const transport = nodemailer.createTransport(
    
    {
        host:process.env.MAILER_HOST,
        port:Number(process.env.MAILER_PORT),  
        // secure: false,  // MUST be false for 2525
        auth:{
            user:process.env.MAILER_USER,
            pass:process.env.MAILER_PASSWORD,
        },
    }
  
);

