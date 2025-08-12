import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Comment} from '../models/comment.model.js';
import { Video } from '../models/video.model.js'
import mongoose, {isValidObjectId} from "mongoose";

// getting comments below videos fething them using pagination
const getVideoComments = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req. query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "Video not found")
    }

    // now fetch your comment as you have founded the video based on provided videoId

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                // Filter comments for a specific video
                video: new mongoose.Types.ObjectId(videoId)
            },
        },
        {
            // returns an array of users (even if there’s only one match).
            $lookup:{
                // Join with users collection
                from: "users",  // Collection to join with
                localField: "owner", // Field in Comment collection
                foreignField: "_id",  // Field in User collection
                as: "ownerDetails",  // Result will be stored here (array)
            }
        },
        {
            //  converts it into a single object for easier access.
            $unwind: "$ownerDetails",
        },
        {
            $sort: {
                // sort comments via descending order (latest --> oldest)
                createdAt: -1,
            }
        },
        {
            //  Shape the final output
            $project:{
                _id: 1,
                content: 1,
                createdAt: 1,
                owner: {
                    username: "$ownerDetails.username",
                    fullName: "$ownerDetails.fullName",
                    avatar: "$ownerDetails.avatar.url"
                },
            },
        },
    ])

    // pagination options 
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    }

    const comment = await Comment.aggregatePaginate(commentsAggregate, options)

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Comments fetched successfully!")
    )
});

const addComment = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    const {content} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video ID")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Content is reqired")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id,
    })

    if(!comment){
        throw new ApiError(400, "Failed to add commment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Comment added successfully!",comment)
    )
})

const updateComment = asyncHandler(async(req,res) => {
    const { commentId } = req.params
    const  { content }  = req.body

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Content is reqired")
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400, "No comment found")
    }

    if(comment.owner.toString() !== req.user?._id.toString){
        throw new ApiError(400, "Not authorized to update comment")
    }

    const updateComment = await Comment.findByIdAndUpdate(
        commentId,
        {$set:{content}},
        {new: true}
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Comment updated Successfully", updateComment)
    );
})

const deleteComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Comment ID")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(400, "Not found")
    }

    // authorization check
    if(comment.owner.toString() !== req.user?._id){
        throw new ApiError(400, "Not authorized to delete this comment!")
    }

    await Comment.findByIdAndDelete(commentId);

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Comment deleted Successfully!", {})
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}