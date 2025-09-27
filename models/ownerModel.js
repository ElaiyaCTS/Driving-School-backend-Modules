
// ownerModel.js
import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema({
     photo: {
    type: String,
    // required: [true, 'Photo is required'],
    default: null,
  },
  ownerName: { //no
    type: String,
    required: [true, 'Owner Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile Number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Mobile number must be 10 digits'],
  },
  AlternativeNumber: {
    type: String,
    required: [true, 'Mobile Number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Mobile number must be 10 digits'],
  },
  active: {//no
    type: Boolean,
    default: true, // IT Admin can set to false to disable access
  },
  userId: {//no
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
     ref: 'organization',
  },
}, { timestamps: true });

export default mongoose.model('Owner', ownerSchema);
