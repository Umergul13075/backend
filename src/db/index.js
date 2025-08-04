import mongoose from "mongoose"
import {DB_NAME} from '../constants.js'
// asynchronous method likha hai
// asynchronous method jb bhi complete hota hai tou technically yeh app ko promise bhi return krta hai .then and .catch k sath.
const connectDB = async () => {
  try{
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`MongoDB connected !! DATABASE HOST ${connectionInstance.connection.host}`)
  }
  catch(error){
    console.log("MongoDB connection error", error)
    process.exit(1);
  }
}
export default connectDB;