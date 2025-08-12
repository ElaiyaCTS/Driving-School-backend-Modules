import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  branchName: {
    type: String,
    required: [true, 'Branch Name is required'],
    trim: true,
  },
  code: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true,
  },
  address: {
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organization',
    required: true,
  },
  branchAdmins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    }
  ],
  active: {
    type: Boolean,
    default: true, // controlled by IT Admin or Owner
  },
}, { timestamps: true });


// ✅ Auto-generate code like "BRN-001"
branchSchema.pre('save', async function (next) {
  if (this.code) return next(); // Skip if code already exists

  try {
    const lastBranch = await mongoose.model('Branch').findOne().sort({ createdAt: -1 });
    let lastNumber = 0;

    if (lastBranch && lastBranch.code) {
      const match = lastBranch.code.match(/BRN-(\d+)/);
      if (match) {
        lastNumber = parseInt(match[1], 10);
      }
    }

    this.code = `BRN-${String(lastNumber + 1).padStart(3, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('Branch', branchSchema);
