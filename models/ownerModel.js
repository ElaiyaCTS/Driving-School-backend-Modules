import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: [true, 'Organization Name is required'],
    trim: true,
  },
  ownerName: {
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
  phone: {
    type: String,
    required: [true, 'Phone Number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Phone number must be 10 digits'],
  },
  address: {
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
  },
  active: {
    type: Boolean,
    default: true, // IT Admin can set to false to disable access
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
}, { timestamps: true });

export default mongoose.model('Owner', ownerSchema);
