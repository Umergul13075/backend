// require('dotenv').config({path: "./env"})
//import mongoose from "mongoose"
//import express from "express"
// import { DB_NAME } from "./constants";

import dotenv from "dotenv"
import connectDB from './db/index.js'

dotenv.config({
    path: "./.env"
})

connectDB();
























/*
const app = express()
// IFFE USED 
;(async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Express cannot listen to database",error);
            throw error
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    }
    catch(error){
        console.error("Error", error)
        throw error
    }
})();
*/
