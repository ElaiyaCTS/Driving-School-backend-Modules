import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { encryptPassword, decryptPassword } from '../util/encrypt.js';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true },
    mobileNumber: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },

    role: {
      type: String,
      required: true,
      enum: ['IT-Admin', 'Owner', 'Branch-Admin', 'Instructor', 'Learner'],
    },

    refId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Use manual population for now (no `ref` or `refPath`)
    },

    otp: { type: Number, default: null },
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

// 🔓 Add decrypted password as virtual
userSchema.virtual('decryptedPassword').get(function () {
  try {
    return decryptPassword(this.password, process.env.JWT_SECRET);
  } catch (err) {
    return 'Decryption Failed';
  }
});

// ✅ Output virtuals
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

export default mongoose.model('User', userSchema);
