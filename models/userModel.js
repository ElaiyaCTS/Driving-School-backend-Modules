//userModel.js
import mongoose from 'mongoose';
import { encryptPassword, decryptPassword } from '../util/encrypt.js';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true },
    // mobileNumber: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    // Role can be one of the following: IT-Admin, Owner, Admin, Instructor, Learner
    // This allows for more flexible role management
    role: {
      type: String,
      required: true,
      enum: ['IT-Admin', 'Owner', 'Admin', 'Instructor', 'Learner'],
    },
    // Reference to the user model
    // This will be used to link the user to different roles
      refId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'refModel',
      required: function () {
        return this.refModel != null; // required only if refModel is provided
      },
      default: null
    },
    refModel: {
      type: String,
      enum: ['Owner', 'Instructor', 'Learner', 'Admin'],
      required: function () {
        return this.refId != null; // required only if refId is provided
      },
      default: null
    },
    // OTP and expiry fields
    otp: { type: String, default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 🔐 Encrypt password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await encryptPassword(this.password, process.env.JWT_SECRET);
  next();
});

// // 🔓 Add decrypted password as virtual
// userSchema.virtual('decryptedPassword').get(function () {
//   try {
//     return decryptPassword(this.password, process.env.JWT_SECRET);
//   } catch (err) {
//     return 'Decryption Failed';
//   }
// });

// // ✅ Output virtuals
// userSchema.set('toObject', { virtuals: true });
// userSchema.set('toJSON', { virtuals: true });

export default mongoose.model('User', userSchema);
