import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import app from "./app.js";


//connect the server

(async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(`server stated on PORT${process.env.PORT}`);
    });
  } catch (error) {
    console.log("startUp error :", error);
    process.exit(1);
  }
})();
