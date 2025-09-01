import Branch from '../models/branchModel.js'; // assuming your model is named this
import Organization from '../models/organizationModel.js';
import mongoose from 'mongoose';
import Admin from '../models/adminModel.js';

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
      throw new Error('Organization not found');
    }

    // Create branch
    const branch = await Branch.create([{ branchName, address, organizationId }], { session });

    // Push branch to organization
    organization.branches.push(branch[0]._id);
    await organization.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Branch created successfully', branch: branch[0] });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
// 📌 Get all branches for an organization
export const getAllBranches = async (req, res) => {
  const { organizationId } = req.params;    

  try {
    const branches = await Branch.find({ organizationId })
      .populate('organizationId', 'organizationName')
      .populate('branchAdmins', 'fullName email'); 
    res.status(200).json(branches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get branch by ID
export const getBranchById = async (req, res) => {
  const { branchId } = req.params;

  try {
    const branch = await Branch.findById(branchId)
  .populate({
    path: 'organizationId',
    select:'-branches -owners', // Exclude branches and owners from organization
    populate: {
      path: 'owners',
      select: 'ownerName email mobileNumber' // fields from Owner
    }
  })
  .populate('branchAdmins', 'fullName mobileNumber photo'); // optional if you want admins too

    if (!branch) return res.status(404).json({ error: 'Branch not found' });

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

    if (!updatedBranch) return res.status(404).json({ error: 'Branch not found' });

    res.status(200).json({ message: 'Branch updated', branch: updatedBranch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Delete branch
export const deleteBranch = async (req, res) => {
  const { branchId } = req.params;

  try {
    const deleted = await Branch.findByIdAndDelete(branchId);
    if (!deleted) return res.status(404).json({ error: 'Branch not found' });

    res.status(200).json({ message: 'Branch deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const assignBranchAdmin = async (req, res) => {
  const { branchId, adminId } = req.params;

  try {
    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    if (branch.branchAdmins.includes(adminId)) {
      return res.status(400).json({ error: 'Admin already assigned to this branch' });
    }

    // ✅ Add to branch
    branch.branchAdmins.push(adminId);
    await branch.save();

    // ✅ Also update admin model
    admin.branchId = branchId;
    await admin.save();

    res.status(200).json({ message: 'Admin assigned successfully', branch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Remove assigned Admin from a Branch        

export const removeBranchAdmin = async (req, res) => {
  const { branchId, adminId } = req.params;

  try {
    // ✅ Check if branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });

    // ✅ Check if admin exists and is assigned to this branch
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    if (admin.branchId?.toString() !== branchId) {
      return res.status(400).json({ error: 'Admin is not assigned to this branch' });
    }

    // ✅ Remove from Branch's branchAdmins list
    branch.branchAdmins = branch.branchAdmins.filter(
      (id) => id.toString() !== adminId
    );
    await branch.save();

    // ✅ Optionally nullify Admin's branchId (if not required)
    // OR delete the admin completely if needed
    admin.branchId = null;
    await admin.save();

    res.status(200).json({ message: 'Admin removed from branch successfully', branch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


