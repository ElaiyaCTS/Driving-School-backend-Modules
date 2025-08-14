
 import User from "../models/userModel.js";
import Instructor from "../models/InstructorSchema.models.js";
import Learner from "../models/LearnerSchema.models.js";
import jwt from "jsonwebtoken";
// import fast2sms from "fast-two-sms"; // Install using `npm install fast-two-sms`
import fs from "fs";
import { generateAdmissionNumber } from '../util/generateAdmissionNumber.js';
import {findLearnerFolderInDrive, uploadAndOverwriteFile, createDriveFolder,uploadInstructorFile,deleteFolderFromDrive ,deleteInstructorFileFromDrive} from "../util/googleDriveUpload.js";
import mongoose from 'mongoose';
// import DbConnection from "../config/db.js"; // your existing file
import { connectToDatabase } from "../config/db.js"; 

   //createLearner
   
  const createLearner = async (req, res) => {
      let session;
      let learnerFolderId;

   try {
    // ✅ Ensure DB connection is open
      await connectToDatabase(); 
   

    // ✅ Start DB session after ensuring connection
    session = await mongoose.startSession();
    session.startTransaction();

    const { username, mobileNumber, password, role } = req.body;

    if (!username || !mobileNumber || !password) {
      return res.status(400).json({ message: "Username, Mobile Number, and Password are required" });
    }

    if (role !== "Learner") {
      return res.status(403).json({ message: "Only Learners can be created" });
    }

    const existingLearner = await Learner.findOne({ mobileNumber });
    if (existingLearner) {
      return res.status(409).json({ message: "Learner with this mobile number already exists" });
    }

    const admissionNumber = await generateAdmissionNumber();

    try {
      learnerFolderId = await createDriveFolder(admissionNumber);
    } catch (err) {
      console.error("Error creating Drive folder:", err);
      return res.status(500).json({ message: "Failed to create Drive folder" });
    }

    const fileUrls = {};
    const fileFields = ["photo", "signature", "aadharCard", "educationCertificate", "passport", "notary"];

    if (req.files) {
      for (const field of fileFields) {
        if (req.files[field]) {
          const file = req.files[field][0];
          const fileExtension = file.originalname.split(".").pop();
          const newFileName = `${field}_${admissionNumber}`;
          file.originalname = newFileName;

          const uploadedFile = await uploadAndOverwriteFile(file, learnerFolderId);
          fileUrls[field] = uploadedFile.webViewLink;
        }
      }
    }

    const newLearner = new Learner({
      ...req.body,
      admissionNumber,
      folderId: learnerFolderId,
      userId: null,
      ...fileUrls,
    });

    const newUser = new User({ username, mobileNumber, password, role });
    newUser.refId = newLearner._id;
    newLearner.userId = newUser._id;

    await newLearner.save({ session });
    await newUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Learner created successfully",
      learnerId: newLearner._id,
      learnerData: newLearner,
    });

   } catch (error) {
   if (session) {
     await session.abortTransaction().catch(() => {});
     session.endSession();
   }
 
   if (learnerFolderId) {
     await deleteFolderFromDrive(learnerFolderId).catch(() => {});
   }
 
   // ✅ Handle Mongoose validation errors
   if (error.name === 'ValidationError') {
     const firstErrorKey = Object.keys(error.errors)[0];
     const errorMessage = error.errors[firstErrorKey].message;
     return res.status(400).json({ message: errorMessage });
   }
 
   // ✅ Handle Duplicate Key Error (E11000)
   if (error.code === 11000) {
     const field = Object.keys(error.keyPattern || {})[0]; // username or mobileNumber
     const value = error.keyValue ? error.keyValue[field] : '';
     return res.status(409).json({
       message: `Duplicate ${field}`,
       error: `The ${field} '${value}' is already in use.`,
     });
   }
    handleValidationError(error, res);
   }

  };


 // 📌 READ ALL Learners
    const getAllLearners = async (req, res) => {
    try {
    const { fromdate, todate, search, gender } = req.query;

    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    const paginate = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    const searchFilter = {};

    // Parse ISO dates like 2025-05-18
    const parseISODate = (str) => {
      const date = new Date(str);
      return isNaN(date.getTime()) ? null : date;
    };

    // Parse DD-MM-YYYY
    const parseDDMMYYYY = (str) => {
    if (!str || typeof str !== "string") return null;
    const parts = str.split("-");
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts.map(Number);
    const date = new Date(yyyy, mm - 1, dd);
    return isNaN(date.getTime()) ? null : date;
    };
  
  
  
      const fromDateObj = parseISODate(fromdate);
      const toDateObj = parseISODate(todate);
      if (toDateObj) toDateObj.setHours(23, 59, 59, 999);
  
      if (fromDateObj && toDateObj) {
        searchFilter.joinDate = { $gte: fromDateObj, $lte: toDateObj };
      }
  
      if (gender) {
        searchFilter.gender = { $regex: `^${gender}$`, $options: "i" };
      }
  
      // Check if search is a date (DD-MM-YYYY)
      const parsedSearchDate = parseDDMMYYYY(search);
  
      if (parsedSearchDate) {
        const startOfDay = new Date(parsedSearchDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(parsedSearchDate);
        endOfDay.setHours(23, 59, 59, 999);
  
        searchFilter.joinDate = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      } else if (search) {
        const trimmedSearch = search.trim();
        searchFilter.$or = [
          { fullName: { $regex: trimmedSearch, $options: "i" } },
          { mobileNumber: { $regex: trimmedSearch, $options: "i" } },
          { admissionNumber: { $regex: `^\\s*${trimmedSearch}$`, $options: "i" } },
        ];
      }
  
      const totalLearners = await Learner.countDocuments(searchFilter);
  
      let query = Learner.find(searchFilter)
        .populate("userId", "username mobileNumber role password")
        .sort({ createdAt: -1 });
  
      if (paginate) {
        query = query.skip((page - 1) * limit).limit(limit);
      }
  
      const learners = await query;
  
      const learnersWithDecrypted = learners.map((learner) => {
        const learnerObj = learner.toObject();
        if (learnerObj.userId && learnerObj.userId.decryptedPassword) {
          learnerObj.userId.password = learnerObj.userId.decryptedPassword;
          delete learnerObj.userId.decryptedPassword;
        }
        return learnerObj;
      });
  
      res.status(200).json({
        totalPages: paginate ? Math.ceil(totalLearners / limit) : 1,
        currentPage: paginate ? page : 1,
        totalLearners,
        currentLearners: learnersWithDecrypted.length,
        learners: learnersWithDecrypted,
      });
    } catch (error) {
      console.error("Error in getAllLearners:", error);
      res.status(500).json({
        message: "Server Error",
        error: error.message || error.toString(),
      });
    }
    };
  
 


  // 📌 GET Single Learners by _id
const getLearnersById = async (req, res) => {
  try {
    const { _id } = req.params; // Get _id from request params

    // Find instructor by _id and populate user details
    const learners = await Learner.findById(_id).populate("userId", "username mobileNumber role password");

    // If no learners found, return 404
    if (!learners) {
      return res.status(404).json({ message: "learners not found" });
    }
 // Convert to plain object
 const learnerObj = learners.toObject();

 // Replace encrypted password with decrypted password
 if (learnerObj.userId && learnerObj.userId.decryptedPassword) {
   learnerObj.userId.password = learnerObj.userId.decryptedPassword;
   delete learnerObj.userId.decryptedPassword; // Optional: clean up
 }

    // Return the learners data
    res.status(200).json(learnerObj);
  } catch (error) {
    handleValidationError(error, res);
  }
};

  
  // 📌 UPDATE Learner

 const updateLearner = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();


  try {
    const { admissionNumber } = req.params;
    const { username,password, mobileNumber, ...otherFields } = req.body;
    // console.log(otherFields);
    
  // return

    // 🔍 Find Learner
    const learner = await Learner.findOne({ admissionNumber }).session(session);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    // 🔍 Find User linked to this Learner
    const user = await User.findById(learner.userId).session(session);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔍 Find Learner's Google Drive Folder
    let learnerFolderId = await findLearnerFolderInDrive(admissionNumber);
    if (!learnerFolderId) {
      return res.status(404).json({ message: "Learner's folder not found in Google Drive" });
    }

    const updatedFields = {};
    const fileFields = ["photo", "signature", "aadharCard", "educationCertificate", "passport", "notary"];

    // 📂 Process File Uploads
    for (const field of fileFields) {
      if (req.files && req.files[field]) {
        const file = req.files[field][0];

        // ✅ Generate new filename (e.g., "photo_ADM202502.jpg")
        const fileExtension = file.originalname.split(".").pop();
        file.originalname = `${field}_${admissionNumber}`;

        // ✅ Upload and overwrite existing file
        const uploadedFile = await uploadAndOverwriteFile(file, learnerFolderId);

        // ✅ Store the new file URL
        updatedFields[field] = uploadedFile.webViewLink;
      }
    }

    // 📞 Ensure mobileNumber is updated in both collections
    if (mobileNumber && mobileNumber !== learner.mobileNumber) {
      const existingUser = await User.findOne({ mobileNumber }).session(session);
      if (existingUser) {
        return res.status(409).json({ message: "Mobile number already in use" });
      }
      learner.mobileNumber = mobileNumber;
      user.mobileNumber = mobileNumber;
    }

    // 📌 Update Learner Fields
    Object.assign(learner, updatedFields, otherFields);

    // 🔑 If password is provided, update it (schema will hash it)
    if (password) {
      user.password = password; // No manual hashing needed
    }

    // 🔄 Sync username with fullName
    user.username = username;

    // ✅ Save Learner and User (triggers schema middleware for password hashing)
    await learner.save({ session });
    await user.save({ session });

    // ✅ Commit Transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Learner updated successfully", learner, user });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    handleValidationError(error, res);
    console.error("Error updating learner:", error);
    // res.status(500).json({ message: "Error updating learner", error: error.message });
  }
};

  

  // 📌 DELETE Learner
  const deleteLearner = async (req, res) => {
    try {
      const { _id } = req.params;
  
      const learner = await Learner.findById(_id);
      if (!learner) {
        return res.status(404).json({ message: "Learner not found" });
      }
  
      await User.findByIdAndDelete(learner.userId); // Delete linked user
      await Learner.findByIdAndDelete(_id);
  
      res.status(200).json({ message: "Learner deleted successfully" });
    }  catch (error) {
    handleValidationError(error, res);
  }
  };

 
export default {

  createLearner,
  getAllLearners,
  updateLearner,
  deleteLearner,
  getLearnersById
};
// export default { createUser };
