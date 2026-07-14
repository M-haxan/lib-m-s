import mongoose from "mongoose";
 const userSchema = mongoose.Schema({
    name :{
        type: String, 
        required:true
    }, 
    email:{
        type: String,
        required: true,
    }, 
    password:{
        type: String,
        required: true
    },
    role:{
        type:String,
        default: "student"
    }, 
    stream:{
        type:String,
        required: true
    },
    year:{
        type: Number,
       required: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    preferences: {
        type: [String],
        default: []
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
 }, { timestamps: true })
const UserModel = mongoose.model("User", userSchema)
export default UserModel; 