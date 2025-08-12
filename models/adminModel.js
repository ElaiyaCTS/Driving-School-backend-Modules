import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    fullName: {
    type: String,
    required: [true, 'Full Name is required'],
    trim: true,
  },
  fathersName: {
    type: String,
    required: [true, "Father's Name is required"],
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile Number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Mobile Number must be 10 digits'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of Birth is required'],
    trim: true,
  },
  gender: {
    type: String,
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Gender must be Male, Female, or Other',
    },
    required: [true, 'Gender is required'],
    trim: true,
  },
  bloodGroup: {
    type: String,
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      message: 'Invalid Blood Group',
    },
    required: [true, 'Blood Group is required'],
    trim: true,
  },
 address: {
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
  },
  photo: {
    type: String,
    // required: [true, 'Photo is required'],
  },
  joinDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Join Date is required'],
  }, 
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true,
    unique: true,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    default: null, // Optional, can be null if admin is not assigned to a branch
  },
  active: {
    type: Boolean,
    default: true, // IT Admin or Owner can disable
  },
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);
