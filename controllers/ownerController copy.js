import Owner from '../models/ownerModel.js';
import Organization from '../models/organizationModel.js';
import User from '../models/userModel.js';
import { handleErrorResponse } from "../util/errorHandler.js"; 

// 🔸 CREATE Owner
export const createOwner = async (req, res) => {
  try {
    const {
      organization_Name,
      organization_Email,
      organization_MobileNumber,
      organization_Address,
      ownerName,
      email,
      mobileNumber,
      AlternativeNumber,
      address,
      username,
      password,
    } = req.body;

     // ✅ 1. Create organization if it doesn't exist
     

    // ✅ 2. Create User
    const user = new User({
      username,
      password,
      role: 'Owner',
      refId: null,
    });

    const savedUser = await user.save();

    // ✅ 3. Create Owner
    const newOwner = new Owner({
      organizationName,
      ownerName,
      email,
      mobileNumber,
      address,
      userId: savedUser._id,
    });

    const savedOwner = await newOwner.save();

    // ✅ 3. Link refId back to Owner in User
    savedUser.refId = savedOwner._id;
    await savedUser.save();

    res.status(201).json({ message: 'Owner created successfully', data: savedOwner });
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to create owner');
  }
};

// 🔸 GET All Owners
export const getAllOwners = async (req, res) => {
  try {
    const owners = await Owner.find().populate('userId', 'username mobileNumber role');
    res.status(200).json({ data: owners });
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch owners');
  }
};

// 🔸 GET Single Owner
export const getOwnerById = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id).populate('userId', 'username mobileNumber role');
    if (!owner) return res.status(404).json({ message: 'Owner not found' });
    res.status(200).json({ data: owner });
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch owner');
  }
};

// 🔸 UPDATE Owner
export const updateOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      organizationName,
      ownerName,
      email,
      phone,
      address,
      username,
      mobileNumber,
      password,
    } = req.body;

    const owner = await Owner.findById(id);
    if (!owner) return res.status(404).json({ message: 'Owner not found' });

    const user = await User.findById(owner.userId);
    if (!user) return res.status(404).json({ message: 'Linked user not found' });

    // ✅ Update Owner fields
    owner.organizationName = organizationName || owner.organizationName;
    owner.ownerName = ownerName || owner.ownerName;
    owner.email = email || owner.email;
    owner.phone = phone || owner.phone;
    owner.address = address || owner.address;

    // ✅ Update linked user
    user.username = username || user.username;
    user.mobileNumber = mobileNumber || user.mobileNumber;
    if (password) {
      user.password = await encryptPassword(password, process.env.JWT_SECRET);
    }

    await owner.save();
    await user.save();

    res.status(200).json({ message: 'Owner updated successfully', data: owner });
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to update owner');
  }
};

// 🔸 DELETE Owner (and linked User)
export const deleteOwner = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
    if (!owner) return res.status(404).json({ message: 'Owner not found' });

    const userId = owner.userId;

    await Owner.findByIdAndDelete(owner._id);
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Owner and linked user deleted successfully' });
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to delete owner');
  }
};
