// helper file likh rakhi hai utils mein asyncHandler
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'

// asyncHandler ki need nahi hai because hm koi web request hi kr rhay bss hamara yeh custom method hai
const generateAccessAndRefereshToken = async (userId) =>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken =user.generateRefreshToken()
        // console.log(user)

        // saving refresh token in database
        user.refreshToken = refreshToken
        // user,save ko validate ko save lazmi krna wrna koi password wla issue kry ga issi li validateBeforeSave false kia hai 
        // 
        await user.save({ validateBeforeSave: false })

        // console.log(accessToken)
        // console.log(refreshToken)
        return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while geneting access and refresh token")
    }
}

// asyncHandler higher order function hai mtlb(function k andr eik aur function lena)
const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "Registered"
    // })
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
    //  console.log("email:" ,email);
    //  console.log(req.body)
     
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
    // if(!email.include("@")){
    //     throw new ApiError(400, "Email must contain @ symbol")
    // }
    // existed User check
    const existedUser = await User.findOne({
        $or: [ {username}, {email} ]
    })
    
    if(existedUser){
        throw new ApiError(409, "Username or emial already exists")
    }

    // avatar, coverImage check, multer provides us req.files method as well
    const avatarLocalPath = req.files?.avatar[0]?.path
    // console.log(req.files);
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

//req.files — Did the user upload any file?
// Array.isArray(req.files.coverImage) — Is the uploaded file in array form? (yes, because multer gives files in arrays)
// req.files.coverImage.length > 0 — Did user actually upload something under the name coverImage?
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImageLocalPath = req.files.coverImage[0].path
    } 
    
    if(!avatarLocalPath){
        throw new ApiError (400, "Avatar file is required")
    }

    // upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError (400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        // because you dont know coverImage is uploaded or not because it is not necessarily required and you dont't handle it in if case 
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        password, 
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError (500, "Something went wrong while  registreing the user")
    }   

    // await user.deleteMany({ username: null });


    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully!")
    )

})

const loginUser = asyncHandler(async (req,res) => {
    // req body -> data
    // email || username, password
    // validation for user or email existance
    // password check
    // tokens access and refresh token
    // send cookies
    // response

   const {username, email, password} = req.body
//    console.log(req.body);
//    console.log(email);
//    console.log(password);
//    console.log(username)
    // at the moment both are required
   if(!username && !email){
    throw new ApiError(400,"username or email is required!")
   }
    //  but if on situation comes that either on email or usename is required you can use code below

//     if(!(username || email)){
//     throw new ApiError(400,"username or email is required!")
//    }

//    User.findOne({email}) if you are logging on email
//    User.findOne({username}) if you are logging on username
//   ya tou woh email pr mill jaey ya username py
   const user = await User.findOne({
    $or : [{ username } , { email }]
   })
   console.log(user)

   if(!user){
    throw new ApiError(400,"User does not exist")
   }
//  capital User sey hamein mongodb ky methods ka access hoga aur small user sey hamein hamarey custom methods jo hm ney bnaey haan unka access hoga  
   const isPasswordValid = await user.isPasswordCorrect(password)
   if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
   }

   const {accessToken, refreshToken} = await generateAccessAndRefereshToken(user._id)

   const loggedInUser = await User.findById(user._id)
   .select("-password -refreshToken")

//    cookie setup sirf server side pr access hota hai innka
   const options = {
        httpOnly: true,
        secure: true
   }
   return res.status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Successfully"
        )
   )
})


const logoutUser = asyncHandler( async (req, res) => {
    // for logout you need to clear User's cookies
    // secondly you need to reset refresh token you created in the user model

    // logout mein mein masla user ka tha k hamarey pass uska access nahi nahi tha tb ham ney middleware use kr k user ka acces lia abb app isko middleware mein req.user = user bolo ya req.umer = user bolo lkn professional code mein req.user in good indutry practise

    //  abb ham ney  auth.middleware.js mein jo kaam kia ha woh ham yahan iss controller wali file mein bhi kr sakty thy mgr masla yeh tha k ham ussey reuse nahi kr sakty thy isi lia hm ney seprate eik file me as a middleware lika  aur dosra jahan tk use krny ki baat hai jaga jaga tou hamein pta krna pry ga user authenticate hai ya nahi like eg post krty hoay , like krty hoay tou agr tou user authenticate nahi  hai tou iska mtlb hai woh logout hai aur jo logout hai ussey ham post krny ksey dy sakty haan
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    // cookies clear code 
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {} ,"User logged out Successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // app ko access token naya chahiya tou app mjy refresh do gy jo mene appko bejha tha access token k sath start mein
    //  joo app do gy refresh token cookies sey access kr k woh mein mery database mein jo refresh token hai ussey compare kraon ga agr same hoa tou niya accessToken dy doon ga 
    //  req.cookie tou pta hai k cookie mein jo data mene bejha tha ussey acces lia hai pr yeh  req.body q lia hai woh issi liya because hosakta hai na k koi mobile app use kr rha hooo tou issi lia req.body kia
    const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incommingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    try{
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid Refresh Token")
    }
    // incommingRefreshToken yeh lia hai cookies sey 
    // user.refreshToken yeh hm ney lia hai database sey
    // tou cookies aur database waley refresh token ko compare krna hai agr same hai tou new access token generate kr k dey do
    // agr same nahi hai tou error display kr do   
    if(incommingRefreshToken !== user.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
    }
    // abb token cookies mein bejho gy to options bnaney prey gey 
    const options = {
        httpOnly : true,
        secure : true,
    } 

    const {accessToken, newRefreshToken} = await generateAccessAndRefereshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken : newRefreshToken},
            "Access token refreshed"
        )
    )
    }
    catch(error){
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}