import mongoose, { isValidObjectId, mongo } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Like from "../models/like.model.js"
import { ApiResponse } from "../utils/ApiResponse";
import tweet from "../routes/tweet.routes";

const videoLike = asyncHandler(async(req, res) => {
    // jis video pr like kia hai uska id chahiya tou woh req.params sey aey ga
    // isValidObjectId is a function of mongoose to check for valid ID
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }

    // check if document already exists or not fot this user
    const existingVideoLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if(existingVideoLike){
        await Like.findByIdAndDelete(existingVideoLike._id);
        return res
        .status(200)
        .json(
            new ApiResponse(200,"Like removed successfully",{isLiked: false})
        )
    }
    else{
        await Like.create({
            video: videoId,
            likedBy: req.user?._id
        });
        return res
        .status(200)
        .json(200,"Like added successfully", {isLiked: true})
    }
})

const commentLike = asyncHandler(async(req,res) => {
    const {commetId} = req.params
    // check for valid commetId
    if(!isValidObjectId(commetId)){
        throw new ApiError(400,"Invalid comment ID")
    }
    // if valid Id exists find comment by ID from database using await
    const existingCommentLike = await Like.findOne({
        commet: commetId,
        likedBy: req.user?._id
    })

    if(existingCommentLike){
        await Like.findByIdAndDelete(existingCommentLike._id);
        return res
        .status(200)
        .json(new ApiResponse(200,"Like removed successfully!"),{isLiked: false})
    }
    else{
        await Like.create({
            commet: commetId,
            likedBy: req.user?._id
        })

        return res
        .status(200)
        .json(new ApiResponse(200,"Like added successfully!"),{isLiked: true})
    }
})

const tweetLike = asyncHandler (async(req, res)=> {
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid Tweet Id")
    }

    const existingTweetLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    if(existingTweetLike){
        await Like.findByIdAndDelete(existingTweetLike._id)
        return res
        .status(200)
        .json(200,"Like Removed Successfully!",{isLiked: false})
    }
    else{
        await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id,
        })
        return res
        .status(200)
        .json(new ApiResponse(200,"Like added successfully",{isLiked: true}))
    }
})

// get all videos liked by currently loggedIn user

const getAllLikedVideos = asyncHandler(async(req, res) => {
    const LikedVideos = await Like.aggregate([
        {
            // find all "Like" documents created by currentUser haveing that "video" field 
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: {$exists: true}
            },  
        },
        {
            // join with video collection to get details of each liked video 
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as : "videoDetails",
                // nested lookup for owner details
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField:"owner",
                            foreignField: "_id",
                            as: "ownerDetails,"
                        }
                    },
                    {
                        $unwind: "$ownerDetails",
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
			// Project a clean, final structure for the response.
			$project: {
				_id: "$videoDetails._id",
				title: "$videoDetails.title",
				thumbnail: "$videoDetails.thumbnail.url",
				duration: "$videoDetails.duration",
				views: "$videoDetails.views",
				owner: {
					username: "$videoDetails.ownerDetails.username",
					avatar: "$videoDetails.ownerDetails.avatar.url",
				},
			},
		},
	]);

	return res
		.status(200)
		.json(
			new ApiResponse(200, "Liked videos fetched successfully", likedVideos)
		);

});

export {
    videoLike,
    commentLike,
    tweetLike,
    getAllLikedVideos
}