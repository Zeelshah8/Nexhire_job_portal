import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import { v2 } from "cloudinary";
import mongoose from "mongoose";

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone, address, coverLetter } = req.body;

  if (!name || !email || !phone || !address || !coverLetter) {
    return next(new ErrorHandler("all fields required", 400));
  }
  const isAlreadyApplied = await Application.findOne({
    "jobInfo.jobId": id,
    //"jobInfo.jobId": new mongoose.Types.ObjectId(id),
    //"jobSeekerInfo.id":  new mongoose.Types.ObjectId(req.user._id)
     "jobSeekerInfo.id":req.user._id
  });
  if (isAlreadyApplied) {
    return next(new ErrorHandler("you have already applied for this job", 400));
  }
  const jobDetails = await Job.findById(id);
  if (!jobDetails) {
    return next(new ErrorHandler("job not found", 404));
  }
  const jobSeekerInfo = {
    id: req.user._id,
    name,
    email,
    phone,
    address,
    coverLetter,
    role: "Job Seeker",
  };
  if (req.files && req.files.resume) {
    try {
      const cloudinaryResponse = await v2.uploader.upload(req.files.resume.tempFilePath, {
        folder: "Job_Seekers_Resume",
        resource_type:"auto",
      });
      if (!cloudinaryResponse || cloudinaryResponse.error) {
        return next(new ErrorHandler("failed to upload resume to cloudinary", 500));
      }
      jobSeekerInfo.resume = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    } catch (error) {
      return next(new ErrorHandler("failed to upload resume", 500));
    }
  } else {
    if (req.user && !req.user.resume?.url) {
      return next(new ErrorHandler("upload resume", 400));
    }
    jobSeekerInfo.resume = {
      public_id: req.user.resume.public_id,
      url: req.user.resume.url,
    };
  }
  const employerInfo = {
    id: jobDetails.postedBy,
    role: "Employer",
  };
  const jobInfo = {
    jobId:id,
    jobTitle: jobDetails.title,
  };
  const application = await Application.create({
    jobSeekerInfo,
    employerInfo,
    jobInfo,
  });
  res.status(201).json({
    success: true,
    message: "application submitted",
    application,
  });
});

export const employerGetAllApplication = catchAsyncErrors(async (req, res, next) => {
  const { _id } = req.user;

  const applications = await Application.find({
    "employerInfo.id": _id,
    "deletedBy.employer": false,
  });

  res.status(200).json({
    success: true,
    applications,
  });
});


export const jobSeekerGetAllApplication = catchAsyncErrors(async (req, res, next) => {
  const { _id } = req.user;
  const applications = await Application.find({
    "jobSeekerInfo.id": _id,
    "deletedBy.jobSeeker": false,
  });
  res.status(200).json({
    success: true,
    applications,
  });
});


export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("application not found", 404));
  }
  const { role } = req.user;
  switch (role) {
    case "Job Seeker":
      application.deletedBy.jobSeeker = true;
      await application.save();
      break;
    case "Employer":
      application.deletedBy.employer = true;
      await application.save();
      break;
    default:
      console.log("Unhandled role for deleteApplication");
      break;
  }
  if (application.deletedBy.employer && application.deletedBy.jobSeeker) {
    await application.deleteOne();
  }
  res.status(200).json({
    success: true,
    message: "application deleted",
  });
});
