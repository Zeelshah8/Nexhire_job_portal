import  catchAsyncErrors  from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import {User}  from "../models/userSchema.js";
import {v2} from 'cloudinary';
import {sendToken}from "../utils/jwtToken.js"
import { errorMiddleware } from "../middlewares/error.js";

export const register=catchAsyncErrors(async(req,res,next)=>{
    try{
        const {
            name,
            email,
            phone,
            address,
            password,
            role,
            firstNiche,
            secondNiche,
            thirdNiche,
            coverLetter,
        }=req.body;

        if(!name||!email||!phone||!address||!password||!role){
            return next(new ErrorHandler("all fields required",400));
        }
        
        const existingUser=await User.findOne({email})
        if(existingUser){
            return next(new ErrorHandler("email already registered",400))
        }

        const userData={
            name,
            email,
            phone,
            address,
            password,
            role,
            coverLetter,
        };
        if (role === "Job Seeker") {
            if (!firstNiche || !secondNiche || !thirdNiche) {
        return next(new ErrorHandler("Provide all niches", 400));
      }
            userData.niches={
            firstNiche,
            secondNiche,
            thirdNiche,
        };
           if(!req.files||!req.files.resume){
            return next(new ErrorHandler("Resume required",400));
           } 
            

            try{
                const {resume}=req.files;
                    const cloudinaryResponse=await v2.uploader.upload(resume.tempFilePath,{folder:"Job_Seekers_Resume", resource_type: "auto",});
                    if (!cloudinaryResponse||cloudinaryResponse.error){
                        return next(
                            new ErrorHandler("failed to upload to cloud",500)
                        )
                    }
                    userData.resume={
                        public_id:cloudinaryResponse.public_id,
                        url:cloudinaryResponse.secure_url
                    }
                }
                catch(error){
                    console.log("CLOUDINARY ERROR:", error);
                    return next(
                        new ErrorHandler("failed to upload resume",500)
                    )
                }}
            
        if(role==="Employer"){
            userData.niches=undefined;
            userData.resume=undefined;
        }
        const user = await User.create(userData);
        sendToken(user,201,res,"user registered successfully");
    }
    catch(error){
    next(error);
}
})

export const login = catchAsyncErrors(async(req,res,next)=>{
   try{
    const {role,email,password}=req.body;
    if(!role||!email||!password) {
        return next(
            new ErrorHandler("email, password & role required",400)
        );}
     const user=await User.findOne({ email }).select("+password");
     if(!user){
        return next(new ErrorHandler("invalid email or password ",400))
     }
     const isPasswordMatched=await user.comparePassword(password);
     if(!isPasswordMatched){
        return next(new ErrorHandler("invalid password "),400)
     }
     if(user.role != role){
        return next(new ErrorHandler("invalid role"),400);
     }
     user.password=undefined
     sendToken(user,200,res,"user logged successfully")
    }
    catch(error){
        next(error);
    }
    });

export const logout=catchAsyncErrors(async(req,res,next)=>{
    res.status(200).cookie("token","",{
        expires:new Date(Date.now()),
        httpOnly:true,
    }).json({
        success:true,
        message:"logged out successfully"
    })
})

export const getUser=catchAsyncErrors(async(req,res,next)=>{
    const user=req.user;
    res.status(200).json({
        success:true,
        user,
    });
});

export const updateProfile=catchAsyncErrors(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        address:req.body.address,
        coverLetter:req.body.coverLetter,
        niches:{
            firstNiche:req.body.firstNiche,
            secondNiche:req.body.secondNiche,
            thirdNiche:req.body.thirdNiche
        },
    };

    const{firstNiche,secondNiche,thirdNiche}=newUserData.niches;
    if(req.user.role==="Job Seeker" && (!firstNiche||!secondNiche||!thirdNiche)){
    return next(new ErrorHandler("please provide all job niches",400)
    )}
    if(req.files){
        const resume=req.files.resume;
        if(resume){
            const currentResumeId=req.user.resume.public_id;
            if(currentResumeId){
                await cloudinary.uploader.destroy(currentResumeId);
            }
            const newResume=await cloudinary.uploader.upload(resume.tempFilePath,{
                folder:"Job_Seekers_Resume",
            });
            newUserData.resume={
                public_id:newResume.public_id,
                url:newResume.secure_url,
            }
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,    
    });
    res.status(200).json({
success:true,
user,
message:"Profile updated",
});

})

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("New and confirm password do not match", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res, "Password updated successfully");
});
