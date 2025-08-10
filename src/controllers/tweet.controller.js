import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

// tweet creation
const createTweet = asyncHandler(async(req, res) => {
    // tweet krny k lia apko content aur id dono chahiya hogi
    const {content} = req.body;
    const {ownerId} = req.user?._id

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Content is required!!!")
    }
    // tweet creation in database
    const tweet = await Tweet.create({
        content,
        owner: ownerId
    })

    if(!tweet){
        throw new ApiError(400,"Failed to create tweet, please try again.")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,"Tweet created successfully",tweet));
})

const getUserTweetsById = asyncHandler(async(req, res) =>{
    const {userId} = req.params;

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user ID")
    }

    // aggregation pipelines to fetch the tweets and join with user data from owner details
    const tweets = await Tweet.aggregate([
        {
            // filter tweets by owner
            $match: {
                owner : new mongoose.Types.ObjectId(userId),
            },
        },
        {
            // Attach user details to each tweet by looking inside the users collection.
            $lookup:{
                from: "users",
                // take the owner ID from the tweet.
                localField:"owner",
                // find the user whose _id matches that owner ID.
                foreignField: "_id",
                //  Put the found user inside an array called ownerDetails.
                as: "ownerDetails",
                pipeline:[
                    {
                        $project:{
                            // $project keeps only username and avatar.url — hides all other fields like email.
                            username: 1,
                            avatar: "$avatar.url",
                        },
                    },
                ],
            },
        },
        {
            // Since $lookup results in an array (even if there’s only one matching user), $unwind transforms it into a single object for easier access in later stages.
            $unwind: "$ownerDetails"
        },
        {
            // for clean structure of a response
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                owner: "$ownerDetails"
            },
        },
        {
            // Step 5: Sort tweets so newest ones come first.
            // -1 means descending order.
            $sort:{ createdAt: -1}
        }
    ]);

    return res
    .status(200)
    .json( new ApiResponse(200, "Tweet fetched successfully", tweets))
});

const updateTweetsById = asyncHandler(async(req, res) => {
    const {tweetId} = req.params;
    const {content} = req.body;

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Content is required")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid Id")
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(400,"No tweet found!")
    }

    // Authorization for only owner to change the tweets
    if(tweet.owner.toString() !== req.user?._id.toString()){
          throw new ApiError(400,"Not Authorized to update this tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },
        {
            new: true
        }
    );

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully", updatedTweet))
})

const deleteTweet = asyncHandler(async(req, res)=>{
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(400, "Tweet not found")
    }

    // authorization for deletion of tweet
    if(tweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "You are not authorized to delete this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully",{}));
})

export{
    createTweet,
    deleteTweet,
    updateTweetsById,
    getUserTweetsById
}