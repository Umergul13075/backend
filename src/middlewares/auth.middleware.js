// verifyJWT lssi lia q k jab app ney user ko login krwaya tou app ney usko token dy diya inhee ki basis pr mein check kroon ga user login hai ya nahi  
// middleware actually hamein routes mein use hotey
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
//  agr app k pass true login hoa tou mein req k andr naya object create kroon ga likelise req.user kr k 
export const verifyJWT = asyncHandler (async (req, _, next) => {
       try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Beare ", "") 

       if(!token){
            throw new ApiError(401, "Unauthorized Access")
       }
       console.log(token)
    //    you got the token now you need to verify it 
       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    //    in userSchema.methods.generateAccessToken you gave filed name as _id
       const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

       console.log(user)
       if(!user){
        // discussion about frontend
        throw new ApiError(401, "Invalid Access Token")
       }

       req.user = user;
       console.log(user);
       next()
       }
       catch(error){
        throw new ApiError(401, error?.message || "Invalid Access Token")
       }
       
})




// This code is about verifying the JWT token that the user sends — to check if the user is logged in or not. It's called verifyJwt middleware and is used before protected routes.

// 🔐 WHY THIS IS NEEDED
// When a user logs in, we give them a JWT token (a proof of login).

// But in every request to a protected route (e.g. GET /dashboard), we need to check if this token is valid.

// That’s what this middleware does!

// ✅ STEP-BY-STEP EXPLANATION
// // This is a helper to catch async errors without try-catch manually

// import { asyncHandler } from "../utils/asyncHandler.js"

// import jwt from "jsonwebtoken" // to verify the token
// import { User } from "../models/user.model.js" // to fetch user from DB
// 🔎 MIDDLEWARE FUNCTION

// export const verifyJwt = asyncHandler(async (req, res, next) => {

// This is the function we will add to routes where we want only logged-in users to access.

// 🧠 STEP 1: Get token

// const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
// First, try to get the accessToken from cookies (used in web apps).

// If not in cookies, try to get it from the header (Authorization: Bearer <token>)

// Remove the word "Bearer " to get only the actual token value.

// 🧠 STEP 2: If token is missing


// if (!token) {
//   throw new ApiError(401, "Unauthorized Access")
// }
// If no token is found → throw error: "Unauthorized"

// 🧠 STEP 3: Verify token

// const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
// Now we decode (verify) the token using the secret key we used while signing it.

// This gives us the user ID and other info inside the token.

// 🧠 STEP 4: Find user in DB

// const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
// Use the _id from token to find the actual user from database.

// We are removing the password and refreshToken from the data we get using .select(...) so we don’t pass sensitive info.

// 🧠 STEP 5: If user doesn’t exist

// if (!user) {
//   throw new ApiError(401, "Invalid Access Token")
// }
// If no user found, it means the token is invalid (maybe user is deleted or token is fake).

// 🧠 STEP 6: Add user to request

// req.user = user;
// next();
// Attach the found user to req.user so that next functions (like controllers) can use this.

// Call next() to move forward to the actual route/controller.

// 🔁 REAL LIFE USAGE EXAMPLE
// In your route file:

// router.get("/dashboard", verifyJwt, getDashboard)
// This means: “Before showing dashboard, check if user is logged in.”

// ❓WHY USE THIS?
// To protect routes, and make sure only valid/logged-in users can access sensitive endpoints like:

// Profile
// Order History
// Admin dashboard
// User settings

