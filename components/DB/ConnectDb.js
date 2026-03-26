import mongoose from "mongoose";

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.PAT);
        console.log("Connect aguthu")
    }
    catch{
        console.log("Connect agala")
    }
};

export default connectDB;