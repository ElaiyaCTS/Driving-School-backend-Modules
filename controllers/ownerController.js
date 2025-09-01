import Owner from "../models/ownerModel.js";
import Organization from "../models/organizationModel.js";
import User from "../models/userModel.js";
import { handleErrorResponse } from "../util/errorHandler.js";
import mongoose from "mongoose";
// controller/organizationController.js

// 🔸 Create Organization with Owner

export const createOrganizationWithOwner = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      organizationName,
      organizationEmail,
      organizationMobileNumber,
      organizationAddress,
      ownerName,
      email,
      mobileNumber,
      AlternativeNumber,
      address,
      username,
      password,
    } = req.body;
// return
    // Check if mobile/email/username already exists
    const mobileNumberExists = await Owner.findOne({ mobileNumber });
    if (mobileNumberExists) {
      return res
        .status(400)
        .json({ message: "Owner mobileNumber already exists" });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Step 1: Create User first (no refId yet)
    const [newUser] = await User.create(
      [
        {
          username,
          password,
          role: "Owner",
        },
      ],
      { session }
    );

    // Step 2: Create Owner with userId
    const [newOwner] = await Owner.create(
      [
        {
          ownerName,
          email,
          mobileNumber,
          AlternativeNumber,
          address,
          userId: newUser._id,
        },
      ],
      { session }
    );

    // Step 3: Update User with dynamic ref
    newUser.refId = newOwner._id;
    newUser.refModel = "Owner";
    await newUser.save({ session });

    // Step 4: Create Organization and link owner
    const [newOrg] = await Organization.create(
      [
        {
          organizationName,
          organizationEmail,
          organizationMobileNumber,
          organizationAddress,
          owners: [newOwner._id],
          branches: [],
        },
      ],
      { session }
    );

    // Step 5: Link organizationId to owner
     newOwner.organizationId = newOrg._id; // Link owner to organization
    await newOwner.save({ session });
    
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Organization, owner, and user created successfully",
      organization: newOrg,
      owner: newOwner,
      user: newUser,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    handleErrorResponse(res, error, "Failed to create organization");
  }
};

// 🔸 Add Co-Owner to Organization
export const addCoOwnerToOrganization = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
   console.log(req.body);

  try {
    const { orgId } = req.params;

    const {
      ownerName,
      email,
      mobileNumber,
      AlternativeNumber,
      address,
      username,
      password,
    } = req.body;

    // Check if email or mobile already exists
    const mobileNumberExists = await Owner.findOne({ mobileNumber });
    if (mobileNumberExists)
      return res
        .status(400)
        .json({ message: "Owner mobileNumber already exists" });

    const userExists = await User.findOne({ username });
    if (userExists)
      return res.status(400).json({ message: "Username already exists" });

    // Step 1: Create User
    const [newUser] = await User.create(
      [
        {
          username,
          password,
          role: "Owner",
          refId: null,
        },
      ],
      { session }
    );

    // Step 2: Create Co-Owner
    const [newOwner] = await Owner.create(
      [
        {
          ownerName,
          email,
          mobileNumber,
          AlternativeNumber,
          address,
          userId: newUser._id,
      organizationId: orgId, // Ensure organizationId is set

        },
      ],
      { session }
    );

  
        // Step 3: Update User with dynamic ref
    newUser.refId = newOwner._id;
    newUser.refModel = "Owner";
    await newUser.save({ session });

    // Step 4: Push co-owner to organization
    const updatedOrg = await Organization.findByIdAndUpdate(
      orgId,
      { $push: { owners: newOwner._id } },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Co-owner added to organization successfully",
      organization: updatedOrg,
      owner: newOwner,
      user: newUser,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    handleErrorResponse(res, error, "Failed to add co-owner");
    // res.status(500).json({ message: 'Failed to add co-owner', error: error.message });
  }
};

// 🔸 GET All Owners
export const getAllOwners = async (req, res) => {
  try {
    const owners = await Owner.find().populate("userId" );
    res.status(200).json(owners);
  } catch (error) {
    handleErrorResponse(res, error, "Failed to fetch owners");
  }
};

// 🔸 GET Owner by ID
export const getOwnerById = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id).populate("userId" );
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    res.status(200).json(owner);
  } catch (error) {
    handleErrorResponse(res, error, "Failed to get owner");
  }
};

// 🔸 UPDATE Owner
export const updateOwner = async (req, res) => {
  try {
    const { ownerName, email, mobileNumber, AlternativeNumber, address } = req.body;

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.params.id,
      {
        ownerName,
        email,
        mobileNumber,
        AlternativeNumber,
        address,
      },
      { new: true }
    );

    if (!updatedOwner)
      return res.status(404).json({ message: "Owner not found" });

    res.status(200).json({
      message: "Owner updated successfully",
      owner: updatedOwner,
    });
  } catch (error) {
    handleErrorResponse(res, error, "Failed to update owner");
  }
};

// 🔸 UPDATE Organization
export const updateOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;

    const {
      organizationName,
      organizationEmail,
      organizationMobileNumber,
      organizationAddress,
    } = req.body;

    const updatedOrg = await Organization.findByIdAndUpdate(
      orgId,
      {
        ...(organizationName && { organizationName }),
        ...(organizationEmail && { organizationEmail }),
        ...(organizationMobileNumber && { organizationMobileNumber }),
        ...(organizationAddress && { organizationAddress }), // must be full object if updating address
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.status(200).json({
      message: "Organization updated successfully",
      organization: updatedOrg,
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    handleErrorResponse(res, error, "Failed to delete owner");
    // res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 🔸 DELETE Owner
// export const deleteOwner = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const ownerId = req.params.id;

//     // Step 1: Delete user linked to owner
//     await User.deleteMany({ refId: ownerId }, { session });

//     // Step 2: Remove owner from any organizations
//     await Organization.updateMany(
//       { owners: ownerId },
//       { $pull: { owners: ownerId } },
//       { session }
//     );

//     // Step 3: Delete owner
//     const deletedOwner = await Owner.findByIdAndDelete(ownerId, { session });
//     if (!deletedOwner) {
//       throw new Error('Owner not found');
//     }

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({ message: 'Owner and related user deleted successfully' });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     handleErrorResponse(res, error, 'Failed to delete owner');
//   }
// };

// 🔸 DELETE Owner
export const removeOwnerFromOrganization = async (req, res) => {
  try {
    const { orgId, ownerId } = req.params;

    const updatedOrg = await Organization.findByIdAndUpdate(
      orgId,
      { $pull: { owners: ownerId } },
      { new: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.status(200).json({
      message: "Owner removed from organization successfully",
      organization: updatedOrg,
    });
  } catch (error) {
    console.error("Error removing owner from organization:", error);
    handleErrorResponse(res, error, "Failed to delete owner");

    // res.status(500).json({ message: 'Internal Server Error' });
  }
};
