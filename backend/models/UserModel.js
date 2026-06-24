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
    }
 })
const UserModel = mongoose.model("User", userSchema)
export default UserModel; 