class ApiResponse {
    constructor(statusCode, message = "Success", data){
        this.statusCode = statusCode
        this.message = message
        this.data = data
        this.success = statusCode < 400

    }
}
export {ApiResponse}
// ===========SERVER STATUS CODES============
// Informational responses (100 – 199)
// Successful responses (200 – 299)
// Redirection messages (300 – 399)
// Client error responses (400 – 499)
// Server error responses (500 – 599)