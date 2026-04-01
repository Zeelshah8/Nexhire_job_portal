import cron from "node-cron";
import {Job} from "../models/jobSchema.js";
import {User} from "../models/userSchema.js";
import {sendEmail} from "../utils/sendEmail.js";

export const newsLetterCron=()=>{
    cron.schedule("*/2 * * * *",async()=>{
        console.log("running cron job")
        const jobs=await Job.find({newsLettersSent:false});
        for(const job of jobs){
            try{
                const filteredUsers=await User.find({
                    $or:[
                        {"niches.firstNiche":job.jobNiche},
                        {"niches.secondNiche":job.jobNiche},
                        {"niches.thirdNiche":job.jobNiche},
                    ]
                });
                for(const user of filteredUsers){
                    const subject=`Hot Job Alert: ${job.title} in ${job.jobNiche} available now.`;
                    const message=`Hi ${user.name},\n\nGreat news! a new  job that fits your niche has just been posted.
                     The position is for ${job.title} with ${job.companyName}, and they are looking to hire immediately.\n\n
                     Job details:\n Position: ${job.title}\n Company: ${job.companyName}\n Location: ${job.location}\n Salary: ${job.salary}\n\nDon't wait too long! Job openings like these are filled quickly.\n\nBest Regards !!`;
                    sendEmail({
                        email:user.email,
                        subject,
                        message,                       
                    })
                }
                job.newsLettersSent=true;
            }
            catch(error){
                console.log("eror in node cron catch block");
                return next(console.error(error||"some error in cron"));
            }
        }
    })
}
