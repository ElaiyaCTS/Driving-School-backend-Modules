import Instructor from "../models/InstructorSchema.models.js";
import Learner from "../models/LearnerSchema.models.js";
import Admin from "../models/adminModel.js";
import Owner  from "../models/ownerModel.js";

export const getUserInfoByRole = async (role, refId) => {
    if (!role || !refId) return null;
  
    switch (role) {
      case 'Owner':
        return await Owner.findById(refId);
      case 'Admin':
        return await Admin.findById(refId);
      case 'Instructor':
        return await Instructor.findById(refId);
      case 'Learner':
        return await Learner.findById(refId);
      default:
        return null;
    }
  };