// helper file likh rakhi hai utils mein asyncHandler
import {asyncHandler} from "../utils/asyncHandler.js";
// asyncHandler higher order function hai mtlb(function k andr eik aur function lena)
const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "Registered"
    })
} )

const login = asyncHandler(async(req, res)=>{
    res.status(200).json({
        message: "LoggedIn"
    })
})
export {registerUser , login}