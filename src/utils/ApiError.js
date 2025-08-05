 class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message) //This makes sure that the built-in Error class knows the error message and handles it properly.
        this.statusCode = statusCode // Save the status code
        this.message = message // Save the message
        this.data = null   // Keep data empty (optional use)
        this.success = false; // This error means the operation failed
        this.errors = errors  // Save the extra errors if any

        // This part just helps developers trace where the error happened in the code.
        if(stack){
            this.stack = stack // If custom stack trace is provided, use it
        }else{
            Error.captureStackTrace(this, this.constructor) // Else auto generate it
        }
    }
}
export {ApiError}


//  So what does super(message) do?
// super() is used to call the parent class constructor.

// Since Error is the parent, you're telling JavaScript:
// 👉 “Hey, please run the Error class’s code with this message.”

