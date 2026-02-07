import mongoose from "mongoose";

 const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
            console.log("MongoDb connect");
    } catch (error) {
    console.log("Mongodb is not connectd",error);
      process.exit(1);
    }
}
export default connectDB;
