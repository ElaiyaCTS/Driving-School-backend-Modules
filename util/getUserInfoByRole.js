import Instructor from "../models/InstructorSchema.models.js";
import Learner from "../models/LearnerSchema.models.js";
import Admin from "../models/adminModel.js";
import Owner  from "../models/ownerModel.js";

export const getUserInfoByRole = async (role, refId) => {
    if (!role || !refId) return null;
  

    switch (role) {
      case 'Owner':
     const owner = await Owner.findById(refId);
         return owner
      case 'Admin':
      const admins =await Admin.findById(refId);
    //   console.log("Admin",admin);
      
        return admins
      case 'Instructor':
        const Instructors= await Instructor.findById(refId);
        console.log('Instructor:', Instructors)
        return Instructors
      case 'Learner':
        const Learners= await Learner.findById(refId);
        return Learners
      default:
        return null;
    }
  };