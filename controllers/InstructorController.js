import User from "../models/userModel.js";
import Instructor from "../models/InstructorSchema.models.js";
import Learner from "../models/LearnerSchema.models.js";
import {
  findLearnerFolderInDrive,
  uploadAndOverwriteFile,
  createDriveFolder,
  uploadInstructorFile,
  deleteFolderFromDrive,
  deleteInstructorFileFromDrive,
} from "../util/googleDriveUpload.js";
import mongoose from "mongoose";
// import DbConnection from "../config/db.js"; // your existing file
import { connectToDatabase } from "../config/db.js";
import { handleErrorResponse } from "../util/errorHandler.js";
import { ifError } from "assert";
import { log } from "console";

// <<<<<<<<<<<<< Instructor >>>>>>>>>>>>>>>

// 🔧 Reusable Validation & Cast Error Handler

const handleValidationError = (error, res) => {
  // console.log(error);

  const toTitleCase = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, " $1");

  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => {
      const field = toTitleCase(err.path || "Field");

      // ✅ Mongoose puts CastError inside ValidationError
      if (err.name === "CastError") {
        if (err.kind === "number") return `${field} must be a number`;
        if (err.kind === "ObjectId") return `${field} must be a valid ID`;
        return `${field} must be a valid ${err.kind}`;
      }

      // ✅ Handle regular ValidationError
      return `${field} is invalid: ${err.message}`;
    });

    return res.status(400).json({ message: "Validation failed", errors });
  }

  // ✅ Top-level CastError not inside ValidationError
  if (error.name === "CastError") {
    const field = toTitleCase(error.path || "Field");

    if (error.kind === "number") {
      return res.status(400).json({
        message: "Validation failed",
        errors: [`${field} must be a number`],
      });
    }

    return res.status(400).json({
      message: "Validation failed",
      errors: [`${field} must be a valid ${error.kind}`],
    });
  }

  // Fallback
  console.error("❌ Unhandled Error:", error);
  return res.status(500).json({ message: "Internal server error" });
};

// 📌 Create Instructor with error handling
// const createInstructor = async (req, res) => {
//   const { username, mobileNumber, password, role } = req.body;

//   if (!req.branchId) {
//         const err = new Error("Branch ID is not supported in this endpoint");
//         err.status = 401;   // set custom status
//         throw err;
//       }

//   // Validate required fields
//   if (!username || !mobileNumber || !password || !role) {
//     return res.status(400).json({
//       message: "Missing required fields",
//       missingFields: {
//         username: username !== undefined ? "Provided" : "Missing",
//         mobileNumber: mobileNumber !== undefined ? "Provided" : "Missing",
//         password: password !== undefined ? "Provided" : "Missing",
//         role: role !== undefined ? "Provided" : "Missing",
//       },
//     });
//   }

//   try {
//     if (role === "Admin") {
//       return res.status(403).json({ message: "Cannot create admin" });
//     }

//     const newUser = new User({ username, mobileNumber, password, role });

//     delete req.body.username;
//     delete req.body.password;

//     let newRoleData;

//     if (role === "Instructor") {
//       delete req.body.role;
//       newRoleData = new Instructor({ ...req.body });
//       newUser.refId = newRoleData._id;
//       newRoleData.userId = newUser._id;
//       newRoleData.branchId = req.branchId, // ✅ Use branchId from JWT;

//       const fileUrls = {};
//       const fileFields = ["photo"];
//       const uploadedFiles = []; // Store uploaded file details for rollback

//       if (req.files) {
//         for (const field of fileFields) {
//           if (req.files[field]) {
//             const file = req.files[field][0];

//             // ✅ Generate a new file name
//             const fileExtension = file.originalname.split(".").pop();
//             const newFileName = `${field}_${newRoleData._id}`;

//             file.originalname = newFileName; // Rename before upload

//             // ✅ Upload file
//             const uploadedFile = await uploadInstructorFile(file);
//             fileUrls[field] = uploadedFile.webViewLink;
//             uploadedFiles.push(uploadedFile.id); // Store fileId for rollback
//           }
//         }
//       }

//       newRoleData.photo = fileUrls["photo"];

//       try {
//         await newRoleData.save();
//         await newUser.save();
//         res.status(201).json({
//           message: `${newUser.role} created successfully`,
//           instructorData: newRoleData,
//         });
//       } catch (dbError) {
//         // ❌ If MongoDB save fails, delete uploaded files
//         for (const fileId of uploadedFiles) {
//           await deleteInstructorFileFromDrive(fileId);
//         }
//         throw dbError;
//       }
//     } else {
//       return res.status(500).json({ message: "Error creating user, role undefined" });
//     }
//   } catch (error) {
//     handleErrorResponse(res, error, "Error creating instructor");
//     console.error("Error in createInstructor:", error);
//   }
// };

export const createInstructor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { username, mobileNumber, password } = req.body;
  const role = "Instructor";
  if (!req.branchId) {
    return res
      .status(401)
      .json({ message: "Branch ID is not supported in this endpoint" });
  }

  if (!username || !mobileNumber || !password || !role) {
    return res.status(400).json({
      message: "Missing required fields",
      missingFields: {
        username: username !== undefined ? "Provided" : "Missing",
        mobileNumber: mobileNumber !== undefined ? "Provided" : "Missing",
        password: password !== undefined ? "Provided" : "Missing",
        role: role !== undefined ? "Provided" : "Missing",
      },
    });
  }

  if (role === "Admin") {
    return res.status(403).json({ message: "Cannot create admin" });
  }

  // ✅ define outside so it's accessible in catch
  const uploadedFiles = [];

  try {
    // Step 1: Create User
    const newUser = new User({ username, mobileNumber, password, role });
    delete req.body.username;
    delete req.body.password;

    if (role === "Instructor") {
      delete req.body.role;
      const newRoleData = new Instructor({ ...req.body });
      newUser.refId = newRoleData._id;
      newUser.refModel = role;
      newRoleData.userId = newUser._id;
      newRoleData.branchId = req.branchId;
      newRoleData.organizationId = req.user?.organizationId; // Ensure organizationId is set

      const fileUrls = {};
      const fileFields = ["photo"];

      if (req.files) {
        for (const field of fileFields) {
          if (req.files[field]) {
            const file = req.files[field][0];
            const fileExtension = file.originalname.split(".").pop();
            const newFileName = `${field}_${newRoleData._id}`;
            file.originalname = newFileName;
            const uploadedFile = await uploadInstructorFile(file);
            fileUrls[field] = uploadedFile.webViewLink;
            uploadedFiles.push(uploadedFile.id); // ✅ stored globally
          }
        }
      }

      console.log("File IDs:", uploadedFiles);
      newRoleData.photo = fileUrls["photo"];

      await newRoleData.save({ session });
      await newUser.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: `${newUser.role} created successfully`,
        instructorData: newRoleData,
      });
    }

    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ message: "Error creating user, role undefined" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // ✅ uploadedFiles is always defined (just may be empty)
    for (const fileId of uploadedFiles) {
      await deleteInstructorFileFromDrive(fileId);
    }

    handleErrorResponse(res, error, "Error creating instructor");
    console.error("Error in createInstructor:", error);
  }
};

// 📌 READ ALL Instructors
const getAllInstructors = async (req, res) => {
  try {
    if (!req.branchId) {
      return res
        .status(401)
        .json({ message: "Branch ID is required for this endpoint" });
    }

    if (!req.user?.organizationId) {
      return res
        .status(401)
        .json({ message: "Organization ID is required for this endpoint" });
    }
    const branchId = req.branchId || req.query.branchId;
    const organizationId = req.user?.organizationId || req.query.organizationId;
    const { fromdate, todate, search, gender } = req.query;

    let page = parseInt(req.query.page, 10);
    page = isNaN(page) || page < 1 ? 1 : page; // Ensure page is always >= 1

    let limit = parseInt(req.query.limit, 10);
    limit = isNaN(limit) || limit < 1 ? 15 : limit; // Ensure limit is always >= 1

    let searchFilter = {
      branchId,
      organizationId,
    };
    // Exclude instructor with _id: 67e84533440e905b74bb8763
    const excludeId = new mongoose.Types.ObjectId(process.env.AdminId); // Use AdminId from .env
    searchFilter._id = { $ne: excludeId };

    // Convert fromdate and todate to Date objects
    let fromDateObj = fromdate ? new Date(fromdate) : null;
    let toDateObj = todate ? new Date(todate) : null;

    if (toDateObj) {
      toDateObj.setHours(23, 59, 59, 999); // Include the full day
    }

    // Apply date filtering
    if (fromDateObj && toDateObj) {
      searchFilter.joinDate = { $gte: fromDateObj, $lte: toDateObj };
    }

    // Apply gender filtering if provided
    if (gender) {
      searchFilter.gender = gender;
    }

    // Apply search filter (if any)
    if (search) {
      const trimmedSearch = search.trim(); // Remove spaces from input search

      searchFilter.$or = [
        { fullName: { $regex: trimmedSearch, $options: "i" } },
        { mobileNumber: { $regex: trimmedSearch, $options: "i" } },
        { gender: { $regex: trimmedSearch, $options: "i" } },
        // { email: { $regex: trimmedSearch, $options: "i" } }
      ];
    }

    // Count total instructors (before pagination)
    const totalInstructors = await Instructor.countDocuments(searchFilter);

    // Apply pagination
    const instructors = await Instructor.find(searchFilter)
      .sort({ createdAt: -1 }) // Ensure LIFO order (latest first)
      .populate("userId", "username mobileNumber role password") // Keep existing populate
      .skip((page - 1) * limit) // Skip previous pages
      .limit(parseInt(limit)); // Limit per-page records
    // .lean(); // Convert to plain objects

    // Convert to plain objects and inject decrypted password
    const instructorsWithDecrypted = instructors.map((instructors) => {
      const instructorsObj = instructors.toObject();

      if (instructorsObj.userId && instructorsObj.userId.decryptedPassword) {
        // Replace encrypted password with decrypted one
        instructorsObj.userId.password =
          instructorsObj.userId.decryptedPassword;

        // Optionally remove decryptedPassword from output
        delete instructorsObj.userId.decryptedPassword;
      }

      return instructorsObj;
    });

    // Count instructors in the current page
    const currentInstructors = instructorsWithDecrypted.length;

    // Calculate total pages
    const totalPages = Math.ceil(totalInstructors / limit);

    // Send response
    res.status(200).json({
      totalPages,
      currentPage: parseInt(page),
      totalInstructors,
      currentInstructors, // ✅ New field added
      instructorsWithDecrypted,
    });
  } catch (error) {
    handleValidationError(error, res);
  }
};

// 📌 GET Single Instructor by _id
const getInstructorById = async (req, res) => {
  if (!req.branchId) {
    return res
      .status(401)
      .json({ message: "Branch ID is required for this endpoint" });
  }

  if (!req.user?.organizationId) {
    return res
      .status(401)
      .json({ message: "Organization ID is required for this endpoint" });
  }
  const branchId = req.branchId || req.query.branchId;
  const organizationId = req.user?.organizationId || req.query.organizationId;
  try {
    const { _id } = req.params; // Get _id from request params

    // Find instructor by _id and populate user details
    const instructor = await Instructor.findOne({
      _id,
      branchId,
      organizationId,
    }).populate("userId", "username mobileNumber role password ");

    // If no instructor found, return 404
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    // Convert to plain object
    const instructorsObj = instructor.toObject();

    // Replace encrypted password with decrypted password
    if (instructorsObj.userId && instructorsObj.userId.decryptedPassword) {
      instructorsObj.userId.password = instructorsObj.userId.decryptedPassword;
      delete instructorsObj.userId.decryptedPassword; // Optional: clean up
    }

    // Return the learners data
    res.status(200).json(instructorsObj);
    // Return the instructor data
    // res.status(200).json(instructor);
  } catch (error) {
    handleValidationError(error, res);
  }
};

// 📌 UPDATE Instructor

const updateInstructor = async (req, res) => {
  console.log("updateInstructor");

  if (!req.branchId) {
    return res
      .status(401)
      .json({ message: "Branch ID is required for this endpoint" });
  }

  if (!req.user?.organizationId) {
    return res
      .status(401)
      .json({ message: "Organization ID is required for this endpoint" });
  }
  const branchId = req.branchId || req.query.branchId;
  const organizationId = req.user?.organizationId || req.query.organizationId;
  const { instructorId } = req.params;
  try {
    // ✅ Find the instructor
    const instructor = await Instructor.findOne({
      _id:instructorId,
      branchId,
      organizationId,
    });
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // ✅ Find the linked user
    const user = await User.findById(instructor.userId);
    if (!user) {
      return res.status(404).json({ message: "Linked user not found" });
    }

    // ✅ Update fields from request body (excluding `_id` and `userId`)
    Object.keys(req.body).forEach((key) => {
      if (key !== "_id" && key !== "userId") {
        instructor[key] = req.body[key];
      }
    });

    // ✅ File upload handling (overwriting existing files)
    if (req.files?.photo) {
      const file = req.files.photo[0];

      // 📌 Generate a consistent file name: "photo_instructorId"
      const newFileName = `photo_${instructorId}`;

      // ✅ Rename the file before uploading
      file.originalname = newFileName;

      // 📌 Upload and overwrite the file
      const uploadedFile = await uploadInstructorFile(file);
      instructor.photo = uploadedFile.webViewLink; // Update photo URL
    }
    // return
    // ✅ Save updated instructor details
    await instructor.save();

    // ✅ Sync username and mobileNumber in the User collection
    if (req.body.username) user.username = req.body.username;
    if (req.body.mobileNumber) user.mobileNumber = req.body.mobileNumber;
    if (req.body.password) user.password = req.body.password;

    await user.save();

    res
      .status(200)
      .json({ message: "Instructor updated successfully", instructor });
  } catch (error) {
    console.log(error);
return
    // handleValidationError(error, res);
  }
};

// 📌 DELETE Instructor
const deleteInstructor = async (req, res) => {
  if (!req.branchId) {
    return res
      .status(401)
      .json({ message: "Branch ID is required for this endpoint" });
  }

  if (!req.user?.organizationId) {
    return res
      .status(401)
      .json({ message: "Organization ID is required for this endpoint" });
  }
  const branchId = req.branchId || req.query.branchId;
  const organizationId = req.user?.organizationId || req.query.organizationId;
  try {
    const { _id } = req.params;

    const instructor = await Instructor.findOne(_id, branchId, organizationId);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    await User.findByIdAndDelete(instructor.userId); // Delete linked user
    await Instructor.findByIdAndDelete(_id);

    res.status(200).json({ message: "Instructor deleted successfully" });
  } catch (error) {
    handleValidationError(error, res);
  }
};

export default {
  createInstructor,
  getAllInstructors,
  updateInstructor,
  deleteInstructor,
  getInstructorById,
};
