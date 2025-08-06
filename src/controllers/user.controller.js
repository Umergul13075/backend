// helper file likh rakhi hai utils mein asyncHandler
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
// asyncHandler higher order function hai mtlb(function k andr eik aur function lena)
const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "Registered"
    })
    // step ==>1
    // get user details from frontend if you have no frontend use Postman. you get data now question arise what data will you get? The data you will get through model you have created 

    // step ==>2
    // validations if user has entered correct info like correct email with desired pattern, no filed is empty frontend py bhi lagtay haan backend pr lagna zayada behtar hai
    // validation - not empty

    // step ==>3
    // check if user already exists check it through email whether it's unique or not  also can check through username, email

    // step ==>4
    // check for images, check for avatar either if it exists in disk storage or not

    // step ==>5
    // uplaod them to cloudinary, check again for avatar as well on cloudinary

    // step ==>6
    // create user Object . objects bejhon ga bcz nosql database hai zayada trr objects he bejhay jatey haan
    // -create entry in database 

    // step ==>7
    // remove password and refresh Token field from response 

    // step ==>8
    // check for user creation

    // step ==>9
    // return response

    // form ya json sy data a rha hai tou woh appko req.body sey mil jaey ga
    // step // 1  
     const {fullName, username, email, password} =req.body
     console.log("email:" ,email);
     console.log(req.body)
     
    //  if(fullName === ""){
    //     throw new ApiError(400, "fullname is required")
    //  }
    //  if(username === ""){
    //     throw new ApiError(400, "username is required")
    //  }
    //  if(email === ""){
    //     throw new ApiError(400, "email is required")
    //  }
    //  if(password === ""){
    //     throw new ApiError(400, "password is required")
    //  }
    // upper wala bhi theek hai yeh thora advance syntax hai agr eik bhi true hoa tou error throw kry ga
    // If any one of the fields fullName, email, password, or username is an empty string (after trimming), then trigger this condition in error"
    // inn mein sey koi  bhi field empty hogi tou error throw kry ga
    // check for empty fields
    if(
        [fullName, email, password, username].some((field) =>
            field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }
    // email validation 
    if(!email.include("@")){
        throw new ApiError(400, "Email must contain @ symbol")
    }
    // existed User check
    const existedUser = await User.findOne({
        $or: [ {username}, {email} ]
    })
    console.log(req.body)
    if(existedUser){
        throw new ApiError(409, "Username or emial already exists")
    }

    // avatar, coverImage check, multer provides us req.files method as well
    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log(req.files);
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if(!avatarLocalPath){
        throw new ApiError (400, "Avatar file is required")
    }

    // upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(avatar){
        throw new ApiError (400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        // because you dont know coverImage is uploaded or not because it is not necessarily required and you dont't handle it in if case 
        coverImage: coverImage?.url || "",
        username: username.lowerCase(),
        password, 
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError (500, "Something went wrong while  registreing the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully!")
    )

})
export {registerUser}