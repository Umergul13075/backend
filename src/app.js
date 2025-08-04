import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
const app = express();
// remember jb bhi app middleware use krty haan ya configurations krni ho tou most of the time app app.use() k through krty haan
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))
// jo json data a raha hai uski limit set krni hai
app.use(express.json({limit: "16kb"}))
// jo data url sey a rha hai express ko btana prta hai k wahan sey bhi data a rha hai usko smjhna 
// extended true means nesting the objects
app.use(express.urlencoded({extended: true, limit: "16kb"}))
// for storing images and file like favicon, images in your own server
app.use(express.static("public"))
// cookieParser ka kaam yeh hai k mein mery server sey user k browser ko access kr paon aur uski ki cookies ko set krta hai basically crud operation perform krta hai
app.use(cookieParser())
export { app } 

// Middleware in Express is a function that runs between the request and the response.
// It can modify the request, run some code, or send a response, or pass control to the next function.
// middleware function
// const logger = (req, res, next) => {
//   console.log("Request received:", req.method, req.url);
//   next(); // move to the next middleware or route
// };

//app.use(logger); // apply middleware to all routes