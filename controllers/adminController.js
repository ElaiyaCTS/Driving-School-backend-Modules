import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import Branch from "../models/branchModel.js";
import mongoose from "mongoose";
import {
  uploadAdminFile,
  deleteAdminFileFromDrive,
} from "../util/googleDriveUpload.js";
import { handleErrorResponse } from "../util/errorHandler.js";
import router from "../routes/branchRoutes.js";

// Helper to check valid ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createAdmin = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let uploadedFiles = [];

  try {
    const {
      fullName,
      fathersName,
      mobileNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      joinDate,
      email,
      username,
      password,
      branchId,
    } = req.body;

    // ✅ Validate branchId early if provided
    let branchExists = null;
    if (branchId) {
      if (!isValidObjectId(branchId)) {
        throw new Error("Invalid Branch ID format");
      }
      branchExists = await Branch.findById(branchId).session(session);
      if (!branchExists) {
        throw new Error("Branch not found");
      }
    }

    // ✅ Prepare new Admin instance
    const newAdmin = new Admin({
      fullName,
      fathersName,
      mobileNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      joinDate,
      email,
      organizationId: req.user?.organizationId,
      branchId: branchId || null,
    });

    // ✅ Handle photo upload if provided
    if (req.files?.photo?.[0]) {
      const file = req.files.photo[0];

      // Check file size (5 MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Photo must be less than 5 MB");
      }

      const newFileName = `photo_${newAdmin._id || Date.now()}`;
      file.originalname = newFileName;

      const uploadedFile = await uploadAdminFile(file); // Upload to Drive or your storage
      newAdmin.photo = uploadedFile.webViewLink; // Store public view link
      uploadedFiles.push(uploadedFile.id); // Track for rollback if needed
    }

    // ✅ Save Admin
    await newAdmin.validate();
    await newAdmin.save({ session });

    // ✅ Create linked User
    const user = await User.create(
      [
        {
          username,
          password,
          role: "Admin",
          refId: newAdmin._id,
          refModel: "Admin",
        },
      ],
      { session }
    );

    // ✅ Update admin with userId
    await Admin.findByIdAndUpdate(
      newAdmin._id,
      {
        userId: user[0]._id,
      },
      { session }
    );

    // ✅ If branch provided, push admin into branchAdmins
    if (branchExists) {
      await branchExists.updateOne(
        {
          $push: { branchAdmins: newAdmin._id },
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Admin created successfully",
      data: newAdmin,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Rollback: delete uploaded files
    for (const fileId of uploadedFiles) {
      await deleteAdminFileFromDrive(fileId);
    }
    handleErrorResponse(res, error, "Admin creation failed");
  }
};

// ✅ Get all admins
export const getAllAdmins = async (req, res) => {
  //   const { organizationId } = req.params;
  // if (!req.branchId) {
  //   return res.status(401).json({ message: "Branch ID is required for this endpoint" });
  // }

  if (!req.user?.organizationId) {
    return res
      .status(401)
      .json({ message: "Organization ID is required for this endpoint" });
  }
  // const branchId = req.branchId || req.query.branchId;
  const organizationId = req.user?.organizationId || req.query.organizationId;
  const branchId = req.params || null;

  console.log("Matched path:", req.route.path);
  // will log either '/:organizationId' or '/un-assigned-admin/:organizationId'

  if (req.route.path === "/un-assigned-admin") {
    // Unassigned admins
    try {
      const un_assigned_admins = await Admin.find({
        organizationId,
        $or: [{ branchId: null }, { branchId: { $exists: false } }],
      }).populate("userId", "username role");

      res.json({
        message: "Unassigned admins fetched successfully",
        data: un_assigned_admins,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  } else if (req.route.path === "/get-assigned-admin/:branchId") {
    try {
      if (!branchId) {
        return res
          .status(409)
          .json({ message: "Branch ID is required for this endpoint" });
      }
      const admins = await Admin.find({ organizationId, branchId })
        .populate("branchId", "branchName")
        .populate("userId", "username role");

      res.json({ message: "Admins fetched successfully", data: admins });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  } 
  else if (req.route.path === "/") {

  try {
    if (!req.user?.organizationId) {
      return res
        .status(401)
        .json({ message: "Organization ID is required for this endpoint" });
    }

    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const match = { organizationId };

    // 🔹 Build search filter
    let searchMatch = {};
    if (search && search.trim() !== "") {
      searchMatch = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { gender: { $regex: search, $options: "i" } },
          { mobileNumber: { $regex: search, $options: "i" } },
          { "branch.branchName": { $regex: search, $options: "i" } },
        ],
      };
    }

    const pipeline = [
      { $match: match },

      // Lookup branch
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },

      // Lookup user
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: "$userId" },

      // Apply search
      ...(search ? [{ $match: searchMatch }] : []),

      // Project the same shape as your old output
      {
        $project: {
          _id: 1,
          fullName: 1,
          fathersName: 1,
          mobileNumber: 1,
          dateOfBirth: 1,
          gender: 1,
          bloodGroup: 1,
          address: 1,
          joinDate: 1,
          email: 1,
          branchId: {
            _id: "$branch._id",
            branchName: "$branch.branchName",
          },
          organizationId: 1,
          active: 1,
          photo: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
          userId: {
            _id: "$userId._id",
            username: "$userId.username",
            role: "$userId.role",
            decryptedPassword: "Decryption Failed", // static like old output
            id: { $toString: "$userId._id" },
          },
        },
      },
    ];

    // Count pipeline
    const countPipeline = [...pipeline, { $count: "total" }];

    const [admins, totalCount] = await Promise.all([
      Admin.aggregate([...pipeline, { $skip: skip }, { $limit: parseInt(limit) }]),
      Admin.aggregate(countPipeline),
    ]);

    res.json({
      message: "Admins fetched successfully",
      data: admins,
      total: totalCount[0]?.total || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((totalCount[0]?.total || 0) / parseInt(limit)),
    });
  } catch (error) {
      handleErrorResponse(res, error);
    }

  }

};

// export const getAllAdmins = async (req, res) => {







// };




// ✅ Get single admin
export const getAdminById = async (req, res) => {
  const branchId = req.branchId || req.params.branchId;
  const organizationId = req.user?.organizationId || req.params.organizationId;

  if (!branchId) {
    return res
      .status(401)
      .json({ message: "Branch ID is required for this endpoint" });
  }

  if (!organizationId) {
    return res
      .status(401)
      .json({ message: "Organization ID is required for this endpoint" });
  }

  try {
    const id = req.params.adminId;

    if (!isValidObjectId(id)) throw new Error("Invalid Admin ID format");

    const admin = await Admin.findOne({ _id: id, organizationId, branchId })
      .populate("branchId", "branchName")
      .populate("userId", "username role ");

    if (!admin) throw new Error("Admin not found");

    res.json({ message: "Admin fetched successfully", data: admin });
  } catch (error) {
    handleErrorResponse(res, error, "Failed to fetch admin");
  }
};

// ✅ Update admin
export const updateAdmin = async (req, res) => {
  const branchId = req.branchId || req.params.branchId;
  const organizationId = req.user?.organizationId || req.params.organizationId;
  
  if (!branchId) {
    return res
      .status(401)
      .json({ message: "Branch ID is required for this endpoint" });
  }

  if (!organizationId) {
    return res
      .status(401)
      .json({ message: "Organization ID is required for this endpoint" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  let uploadedFiles = [];
  try {
    const id = req.params.adminId;
    console.log(`Updating admin with ID: ${id}`);

    if (!isValidObjectId(id)) throw new Error("Invalid Admin ID format");

    const {
      fullName,
      fathersName,
      mobileNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      joinDate,
      email,
      username,
      password,
      active,
    } = req.body;

    const admin = await Admin.findOne({_id:id, organizationId, branchId}).session(session);
    if (!admin) throw new Error("Admin not found");

    // ✅ Handle photo replacement
    if (req.files?.photo?.[0]) {
      const file = req.files.photo[0];
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Photo must be less than 5 MB");

      const newFileName = `photo_${admin._id}`;
      file.originalname = newFileName;

      const uploadedFile = await uploadAdminFile(file);
      admin.photo = uploadedFile.webViewLink;
      admin.photoId = uploadedFile.id;
    //   console.log(admin.photo);
    //   console.log(admin.photoId);

      uploadedFiles.push(uploadedFile.id);
    }

    // ✅ Update only allowed fields
    admin.fullName = fullName ?? admin.fullName;
    admin.fathersName = fathersName ?? admin.fathersName;
    admin.mobileNumber = mobileNumber ?? admin.mobileNumber;
    admin.dateOfBirth = dateOfBirth ?? admin.dateOfBirth;
    admin.gender = gender ?? admin.gender;
    admin.bloodGroup = bloodGroup ?? admin.bloodGroup;
    admin.address = address ?? admin.address;
    admin.joinDate = joinDate ?? admin.joinDate;
    admin.email = email ?? admin.email;
    admin.active = active ?? admin.active;

    await admin.save({ session });

    // ✅ Update linked user (if exists)
    if (admin.userId) {
      const userUpdate = { username };
      if (password) userUpdate.password = password;
      await User.findByIdAndUpdate(admin.userId, userUpdate, { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Admin updated successfully", data: admin });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Rollback uploaded files
    // for (const fileId of uploadedFiles) {
    //   await deleteAdminFileFromDrive(fileId);
    // }
    handleErrorResponse(res, error, "Admin update failed");
  }
};

// ✅ Delete admin
export const deleteAdmin = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const id = req.params.adminId;
    if (!isValidObjectId(id)) throw new Error("Invalid Admin ID format");

    const admin = await Admin.findById(id).session(session);
    if (!admin) throw new Error("Admin not found");

    // Delete photo from Drive
    if (admin.photoId) {
      await deleteAdminFileFromDrive(admin.photoId);
    }

    // Remove from branch
    if (admin.branchId) {
      await Branch.findByIdAndUpdate(
        admin.branchId,
        {
          $pull: { branchAdmins: admin._id },
        },
        { session }
      );
    }

    // Delete linked user
    if (admin.userId) {
      await User.findByIdAndDelete(admin.userId, { session });
    }

    // Delete admin
    await Admin.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    handleErrorResponse(res, error, "Admin deletion failed");
  }
};
