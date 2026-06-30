import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import UserModel from '../models/UserModel.js'
import { errorHandler } from '../utils/error.js';


export const registerUser = async(req, res, next)=>{
    console.log("Frontend se data aaya:", req.body);
    try {
        const {name, email, password, role, stream, year} = req.body;
        const existingUser= await UserModel.findOne({email});
        if(existingUser){
            return next(errorHandler(400, "Email Already Exist"))
        }
        const hashPass = await bcrypt.hash(password, 10);
        const user = new UserModel ({
            name:name, 
            email: email, 
            password: hashPass,
            role: role, 
            stream: stream,
            year: year,
        });

        await user.save();
         res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }

}

export const loginUser = async (req, res, next)=>{
    const {email, password} = req.body;
    try{
        const user = await UserModel.findOne({email})
    if(!user){
        return next(errorHandler(404, 'invalid Email Address'))
    }
     const isMatch = await bcrypt.compare(password, user.password);
     if(!isMatch){
        return next(errorHandler(401, 'invalidPassword'))
     }
     const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, { expiresIn: '1d' });
     const {password: pass, ...rest} = user._doc;
     res.cookie('access_token', token, {httpOnly:true}). status(200).json(rest);
    }catch(error){
        next(error);
    }
} 

export const logoutUser = (req, res, next) => {
    try {
        res.clearCookie('access_token');
        res.status(200).json({ message: 'User has been logged out successfully!' });
    } catch (error) {
        next(error);
    }
};