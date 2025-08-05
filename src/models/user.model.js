import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    usename:{
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        // kisi bhi field ko searchable bnana hai optimize tarikay sey tou uss py index : true laga do taky yeh database ki searching py a jaey
        index: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        // boht logon ka name Umer Gul ho sakta hai
        unique: false,
        index: true
    },
    avatar:{
        type: String, // cloudinary URL
        required: true
    },
    coverImage:{
        type: String, // cloudinary URL
    },
    // this alone will make your project next level
    watchHistory:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    // we will use bcrypt npm package
    password:{
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken:{
        type: String
    }
},
    {
        timestamps : true
    }
)

// in mein jeneral function use krna lazmi  arrow function nahi q k arrow function mein this ka access nahi hota tou issi lia q k upper userSchema mein koi data lia hai ussey save krna hai na tou uss k lia uss ka access bhi hona tou chahiya na tou woh hamein jeneral function mein milta hai
userSchema.pre("save", async function(next){

    if(!this.isModified("password")) return next();
    
    this.password = bcrypt.hash(this.password, 12)
    next()

    // if(this.isModified("password")){
    //     this.password = bcrypt.hash(this.password, 10)
    //     next()
    // }    
})
// custom methods to check is password correct
userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password, this.password)
}

// jwt tokens
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.usename,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export const User = mongoose.model("User", userSchema)


// jwt(javascript web token) is a bearer token

// 🔒 1. What is a Hash?
// A hash is like a secret code made from your password.

// Once a password is turned into a hash, it can’t be turned back easily.
// (Example: "mypassword" → "$2a$10$A73J....")

// 🧂 2. What is a Salt?
// Imagine you're cooking and you add salt to your dish to make it unique.

// A salt is a random value added to your password before hashing.

// It makes your password extra unique, even if two people have the same password.

// ✅ Why is it useful?
// So hackers can’t guess or match two same passwords just by comparing the hash.

// 📦 Example:

// password = "123456"
// salt = "xyz$#%"
// hashed = hash("123456xyz$#%")

// 🔁 3. What are Hash Rounds?
// Hashing can be repeated multiple times, like stirring your tea again and again.

// Hash rounds mean: "Hash the password multiple times" (e.g., 10 times).

// More rounds = more secure = slower to crack for hackers.

// ✅ Example:

// Round 1 → abc
// Round 2 → hash(abc)
// Round 3 → hash(hash(abc))
// ...
// 🛡️ More rounds = harder for hacker tools to guess passwords.