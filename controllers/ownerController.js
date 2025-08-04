import Owner from '../models/ownerModel.js';

// ✅ Create Owner
export const createOwner = async (req, res) => {
  try {
    const newOwner = new Owner(req.body);
    const savedOwner = await newOwner.save();
    res.status(201).json(savedOwner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all Owners
export const getAllOwners = async (req, res) => {
  try {
    const owners = await Owner.find().populate('userId', 'name email role');
    res.status(200).json(owners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Owner by ID
export const getOwnerById = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id).populate('userId', 'name email role');
    if (!owner) return res.status(404).json({ error: 'Owner not found' });
    res.status(200).json(owner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Owner
export const updateOwner = async (req, res) => {
  try {
    const updatedOwner = await Owner.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedOwner) return res.status(404).json({ error: 'Owner not found' });
    res.status(200).json(updatedOwner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete Owner
export const deleteOwner = async (req, res) => {
  try {
    const deletedOwner = await Owner.findByIdAndDelete(req.params.id);
    if (!deletedOwner) return res.status(404).json({ error: 'Owner not found' });
    res.status(200).json({ message: 'Owner deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
