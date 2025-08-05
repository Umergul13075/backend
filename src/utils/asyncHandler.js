const asyncHandler = (requestHandler) => {
    return (req, res, next) =>{
        Promise
        .resolve(requestHandler(req, res, next))
        .catch((error)=>next(error))
    }
}

export {asyncHandler}

// how you can understand the method below steps are written:
// 1) const asyncHandler = () => {}
// 2) const asyncHandler = (function) => () => {}
// 3) const asyncHandler = (function) => async () => {}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try{
//         await fn(req, res, next)
//     }
//     catch(error){
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }