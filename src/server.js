require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

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
