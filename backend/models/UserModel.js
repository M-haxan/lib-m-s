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
        enum:["student", "admin"],
        default: "student"
    }, 
    stream:{
        type:String,
        required: function() { return this.role === "student"; }
    },
    year:{
        type: Number,
       required: function() { return this.role === "student"; }
    }
 })
const UserModel = mongoose.model("User", userSchema)
export default UserModel; 