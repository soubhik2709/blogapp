//src/helper/sendVerifyEmial.js -->is it correct folder creation
import { transport } from "../utils/nodemailer.js";

export const sendVerifyEmail = async (name, mail, token) => {
try {
    await transport.verify();
  console.log("SMTP VERIFIED");

  console.log("sendVerifyEmail is running");

  const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

  await transport.sendMail({
    from: process.env.MAILER_USER,
    to: mail,
    subject: "Verify Your Email",
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Please verify your email by clicking below:</p>
      <a href="${verifyUrl}">Click Here</a>
      <p>This link will expire in 10 minutes.</p>
    `,
  });
  console.log("MAIL SENT");
  console.log(`✅ Verification email sent to ${mail}`);
  return true;
} catch (error) {
    console.error("❌ ERROR DURING SIGNUP FLOW:", error);
  throw new Error(error.message || "Failed to send verification email")
}
};

/* 
why do i have to save the verification email in database it will end in 10mins?

const verifyUrl = `${process.env.BACKEND_URL}/auth/verify-email?token=${token}`; For this case i use the backend url but for fullStack i would use the frontend url right
 */
