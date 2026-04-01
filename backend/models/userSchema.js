import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from "validator";
import { validate } from "node-cron";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:[2,"Name must be atleast 3 charcters long"],
        maxLength:[30,"name is too large must be 30 charcters"]
    },
    email:{
        type:String,
        required:true,
        validate:[validator.isEmail,"please enter valid email"]
    },
    phone:{
        type:Number,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    niches:{
        firstNiche:String,
        secondNiche:String,
        thirdNiche:String,
    },
    password:{
        type:String,
        required:true,
        minLength:[6,"Name must be atleast 8 charcters long"],
        maxLength:[30,"name is too large must be 30 charcters"],
        select:false
    },
    resume:{
        public_id:String,
        url:String
    },
    coverLetter:{
        type:String
    },
    role:{
        type:String,
        required:true,
        enum:["Job Seeker","Employer"]
    },
    createdAt:{
        type:String,
        default:Date.now
    },
})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
})

userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

userSchema.methods.getJWTToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRE
    })
}


export const User = mongoose.model("User",userSchema);
