import dotenv from 'dotenv'
import connectDB from "./db/index.js"
import { app } from './app.js'

dotenv.config({
    path: './.env'
})
// asynchronous method execution with promise return with .then and .catch
connectDB()
.then(()=>{
    app.on("Error", (error)=>{
        console.log("Error", error)
        throw error
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MongoDB connection failed!!!", error)
})













/*
require('dotenv').config({path: "./env"})
import mongoose from "mongoose"
import express from "express"
import { DB_NAME } from "./constants";
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
