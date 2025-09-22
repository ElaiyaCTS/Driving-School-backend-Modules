import Branch from "../models/branchModel.js"; // assuming your model is named this
import Organization from "../models/organizationModel.js";
import mongoose from "mongoose";
import Admin from "../models/adminModel.js";

// 📌 Create branch
// export const createBranch = async (req, res) => {
//   const { organizationId } = req.params;
//   const { branchName, address } = req.body;

//   try {
//     const orgExists = await Organization.findById(organizationId);
//     if (!orgExists) return res.status(404).json({ error: 'Organization not found' });

//     const newBranch = await Branch.create({
//       branchName,
//       address,
//       organizationId,
//     });

//     res.status(201).json({ message: 'Branch created', branch: newBranch });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// ✅ CREATE Branch & link to Organization
export const createBranch = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { organizationId } = req.params;
    const { branchName, address } = req.body;

    // Check organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Create branch
    const branch = await Branch.create(
      [{ branchName, address, organizationId }],
      { session }
    );

    // Push branch to organization
    organization.branches.push(branch[0]._id);
    await organization.save({ session });

    await session.commitTransaction();
    res
      .status(201)
      .json({ message: "Branch created successfully", branch: branch[0] });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
// 📌 Get all branches for an organization
// export const getAllBranches = async (req, res) => {
//   const { organizationId } = req.params;

//   try {
//     const branches = await Branch.find({ organizationId })
//       .populate('organizationId', 'organizationName')
//       .populate('branchAdmins', 'fullName email');
//     res.status(200).json(branches);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

export const getAllBranches = async (req, res) => {
  const { organizationId } = req.params;

  const { page = 1, limit = 10, search = "" } = req.query;

  try {
    const matchStage = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };

    const pipeline = [
      { $match: matchStage },

      // Lookup organization
      {
        $lookup: {
          from: "organizations", // collection name
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: "$organization" },

      // Lookup branchAdmins
      {
        $lookup: {
          from: "admins", // collection name
          localField: "branchAdmins",
          foreignField: "_id",
          as: "branchAdmins",
        },
      },

      // Search filter
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { branchName: { $regex: search, $options: "i" } },
                  {
                    "organization.organizationName": {
                      $regex: search,
                      $options: "i",
                    },
                  },
                  {
                    "branchAdmins.fullName": { $regex: search, $options: "i" },
                  },
                ],
              },
            },
          ]
        : []),

      // Pagination
      { $skip: (page - 1) * Number(limit) },
      { $limit: Number(limit) },

      // Project only required fields
      {
        $project: {
          _id: 1,
          branchName: 1,
          address: 1,
          code: 1,
          active: 1,
          "organization._id": 1,
          "organization.organizationName": 1,
          "branchAdmins._id": 1,
          "branchAdmins.fullName": 1,
          "branchAdmins.email": 1,
          "branchAdmins.mobileNumber": 1,
          "branchAdmins.photo": 1,
        },
      },
    ];

    // Fetch branches
    const branches = await Branch.aggregate(pipeline);

    // Count total for pagination
    const countPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: "$organization" },
      {
        $lookup: {
          from: "admins",
          localField: "branchAdmins",
          foreignField: "_id",
          as: "branchAdmins",
        },
      },
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { branchName: { $regex: search, $options: "i" } },
                  {
                    "organization.organizationName": {
                      $regex: search,
                      $options: "i",
                    },
                  },
                  {
                    "branchAdmins.fullName": { $regex: search, $options: "i" },
                  },
                ],
              },
            },
          ]
        : []),
      { $count: "total" },
    ];

    const countResult = await Branch.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    res.status(200).json({
      branches,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get branch by ID
export const getBranchById = async (req, res) => {
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
    const filter={ _id:branchId,organizationId };
    const branch = await Branch.findOne(filter)
      .populate({
        path: "organizationId",
        select: "-branches -owners", // Exclude branches and owners from organization
        populate: {
          path: "owners",
          select: "ownerName email mobileNumber", // fields from Owner
        },
      })
      .populate("branchAdmins", "fullName mobileNumber photo"); // optional if you want admins too

    if (!branch) return res.status(404).json({ error: "Branch not found" });

    res.status(200).json(branch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Update branch
export const updateBranch = async (req, res) => {
  const { branchId } = req.params;
  const { branchName, address, active } = req.body;

  try {
    const updatedBranch = await Branch.findByIdAndUpdate(
      branchId,
      { branchName, address, active },
      { new: true, runValidators: true }
    );

    if (!updatedBranch)
      return res.status(404).json({ error: "Branch not found" });

    res.status(200).json({ message: "Branch updated", branch: updatedBranch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Delete branch
export const deleteBranch = async (req, res) => {
  const { branchId } = req.params;

  try {
    const deleted = await Branch.findByIdAndDelete(branchId);
    if (!deleted) return res.status(404).json({ error: "Branch not found" });

    res.status(200).json({ message: "Branch deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Assign Admin to Branch with Transaction
export const assignBranchAdmin = async (req, res) => {
  const { branchId, adminId } = req.params;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 🔍 Find branch
    const branch = await Branch.findById(branchId).session(session);
    if (!branch) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Branch not found" });
    }

    // 🔍 Find admin
    const admin = await Admin.findById(adminId).session(session);
    if (!admin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Admin not found" });
    }

    if (branch.branchAdmins.includes(adminId)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "Admin already assigned to this branch" });
    }

    // ✅ Add to branch
    branch.branchAdmins.push(adminId);
    await branch.save({ session });

    // ✅ Update admin
    admin.branchId = branchId;
    await admin.save({ session });

    // 🔒 Commit if all good
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Admin assigned successfully", branch });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};

// ✅ Remove Admin from Branch with Transaction
export const removeBranchAdmin = async (req, res) => {
  const { branchId, adminId } = req.params;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const branch = await Branch.findById(branchId).session(session);
    if (!branch) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Branch not found" });
    }

    const admin = await Admin.findById(adminId).session(session);
    if (!admin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Admin not found" });
    }

    if (admin.branchId?.toString() !== branchId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ error: "Admin is not assigned to this branch" });
    }

    // ✅ Remove from Branch's branchAdmins list
    branch.branchAdmins = branch.branchAdmins.filter(
      (id) => id.toString() !== adminId
    );
    await branch.save({ session });

    // ✅ Nullify admin's branchId
    admin.branchId = null;
    await admin.save({ session });

    // 🔒 Commit changes
    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "Admin removed from branch successfully", branch });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};

// export const assignBranchAdmin = async (req, res) => {
//   const { branchId, adminId } = req.params;
//  console.log(req.params);

//   try {
//     const branch = await Branch.findById(branchId);
//     if (!branch) return res.status(404).json({ error: 'Branch not found' });

//     const admin = await Admin.findById(adminId);
//     if (!admin) return res.status(404).json({ error: 'Admin not found' });

//     if (branch.branchAdmins.includes(adminId)) {
//       return res.status(400).json({ error: 'Admin already assigned to this branch' });
//     }

//     // ✅ Add to branch
//     branch.branchAdmins.push(adminId);
//     await branch.save();

//     // ✅ Also update admin model
//     admin.branchId = branchId;
//     await admin.save();

//     res.status(200).json({ message: 'Admin assigned successfully', branch });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // 📌 Remove assigned Admin from a Branch

// export const removeBranchAdmin = async (req, res) => {
//   const { branchId, adminId } = req.params;

//   try {
//     // ✅ Check if branch exists
//     const branch = await Branch.findById(branchId);
//     if (!branch) return res.status(404).json({ error: 'Branch not found' });

//     // ✅ Check if admin exists and is assigned to this branch
//     const admin = await Admin.findById(adminId);
//     if (!admin) return res.status(404).json({ error: 'Admin not found' });

//     if (admin.branchId?.toString() !== branchId) {
//       return res.status(400).json({ error: 'Admin is not assigned to this branch' });
//     }

//     // ✅ Remove from Branch's branchAdmins list
//     branch.branchAdmins = branch.branchAdmins.filter(
//       (id) => id.toString() !== adminId
//     );
//     await branch.save();

//     // ✅ Optionally nullify Admin's branchId (if not required)
//     // OR delete the admin completely if needed
//     admin.branchId = null;
//     await admin.save();

//     res.status(200).json({ message: 'Admin removed from branch successfully', branch });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
