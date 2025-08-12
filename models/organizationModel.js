
// organizationModel.js
import mongoose from 'mongoose';

const  organizationSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: [true, 'Organization Name is required'],
    trim: true,
  },

  organizationEmail: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
    organizationMobileNumber: {
    type: String,
    required: [true, 'Mobile Number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Mobile number must be 10 digits'],
  },
   organizationAddress: {
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
  },
 
    owners: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
    }
  ],
    branches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    }
  ],
}, { timestamps: true });

export default mongoose.model('organization', organizationSchema);
