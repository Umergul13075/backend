import Express from "express"
import verifyJWT from '../middlewares/auth.middleware.js'
import {
    createTweet,
    deleteTweet,
    updateTweetsById,
    getUserTweetsById
} from '../controllers/tweet.controller.js'

const tweet = Express()

tweet.use(verifyJWT)

tweet.post("/createTweet", createTweet) 
tweet.get("/userTweetsById/userId:", getUserTweetsById) 
tweet.patch("/updateTweet/:tweetId", updateTweetsById) 
tweet.delete("/delete-tweet/:tweetId", deleteTweet)

export default tweet