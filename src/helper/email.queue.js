import { transport } from "../utils/nodemailer.js";

export const sendEmail = async ({to,subject,html})=>{
    await transport.sendMail({
        from :`BlogApp <${process.env.MAILER_USER}`,
        to,
        subject,
        html,
    });
};

