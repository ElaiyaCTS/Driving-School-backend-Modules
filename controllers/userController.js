import mongoose from "mongoose";
import moment from "moment";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import {
  encryptPassword,
  decryptPassword,
  comparePasswords,
} from "../util/encrypt.js";
import { getUserInfoByRole } from "../util/getUserInfoByRole.js";
import cookie from "cookie";
const isProd = process.env.NODE_ENV === "production";
import Subscription from "../models/SubscriptionSchema.js";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";
import Instructor from "../models/InstructorSchema.models.js"; // import the Instructor model.js";
import Learner from "../models/LearnerSchema.models.js";
import Owner from "../models/ownerModel.js"; // import the Owner.js";
import sendOtpEmail from "../util/email.js";
const models = { Admin, Instructor, Learner, Owner };

const JWT_SECRET = process.env.JWT_SECRET || "otp_secret_key";

// login user
const login = async (req, res) => {
  const { username, password } = req.body; // removed role
  //   console.log('username, password:', username,  password)

  try {
    // 🔹 Find user by username or mobileNumber AND ensure active: true
    const user = await User.findOne({ username });

    if (!user)
      return res.status(400).json({ message: "User not found or inactive" });

    // console.log(user);

    // 🔹 Verify password
    const isMatch = await comparePasswords(
      password,
      user.password,
      process.env.JWT_SECRET
    );
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    // console.log('user:', user);
    // return

    // 🔹 Fetch additional user info (role now comes from DB, not request body)
    const userinfo = await getUserInfoByRole(user.role, user.refId);
    if (!userinfo)
      return res.status(400).json({ message: "User info not found" });
    // console.log('====================================');
    // console.log(userinfo);
    // console.log('====================================');
    // 4️⃣ Prepare JWT payload (exclude photo for Owner)

    // 🔹 Get latest subscription for the organization
    let subscriptionInfo = null;
    const subscription = await Subscription.findOne({
      organizationId: userinfo.organizationId,
    }).sort({ endedAt: -1 });

    if (subscription) {
      const isExpired = moment(subscription.endedAt).isBefore(moment());

      // auto-update DB if expired
      if (isExpired && subscription.status !== "expired") {
        await Subscription.findByIdAndUpdate(subscription._id, {
          status: "expired",
        });
      }

      subscriptionInfo = {
        status: isExpired ? "expired" : subscription.status,
        endedAt: subscription.endedAt,
      };
    }

    const payload = {
      id: user._id,
      role: user.role,
      user_id: user.refId,
      Name: userinfo.fullName,
      organizationId: userinfo.organizationId,
      subscription: subscriptionInfo,
    };

    if (user.role) {
      payload.photo = userinfo.photo;
      payload.branchId = userinfo.branchId;
    }
    // if (user.role !== "Owner") {
    //   payload.photo = userinfo.photo;
    //   payload.branchId = userinfo.branchId;
    // }
    // 🔹 Create JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 🔹 Set cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("GDS_Token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      })
    );
    // Prepare response (exclude photo for Owner)
    const responseUser = {
      id: user._id,
      role: user.role,
      user_id: user.refId,
      Name: userinfo.fullName,
      organizationId: userinfo.organizationId,
      subscription: subscriptionInfo,
      photo: userinfo.photo,
    };

    if (user.role !== "Owner") {
      //   responseUser.photo = userinfo.photo;
      responseUser.branchId = userinfo.branchId;
    }
    // if (user.role !== "Owner") {
    //   responseUser.photo = userinfo.photo;
    //   responseUser.branchId = userinfo.branchId;

    // }

    return res.status(200).json({
      message: "Login successful",
      user: responseUser,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res
      .status(500)
      .json({ message: "Server unavailable. Please try again later." });
  }
};

const logout = (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("GDS_Token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
      expires: new Date(0), // Expire immediately
    })
  );

  return res.status(200).json({ message: "Logged out successfully" });
};

// ============================================================
// 1️⃣ Forgot Password - Send OTP via Email (JWT-based)
// ============================================================
// export const forgotPassword = async (req, res) => {
//   const { mobileNumber, email } = req.body;

//   try {
//     const collections = [
//       { model: Admin, name: "Admin" },
//       { model: Instructor, name: "Instructor" },
//       { model: Learner, name: "Learner" },
//       { model: Owner, name: "Owner" },
//     ];

//     let foundUser = null;
//     let userRole = null;

//     for (const { model, name } of collections) {
//       const user = await model.findOne({
//         $or: [{ mobileNumber }, { email }],
//       });
//       if (user) {
//         foundUser = user;
//         userRole = name;
//         break;
//       }
//     }

//     if (!foundUser) {
//       return res.status(404).json({ message: "User not found in any collection" });
//     }

//     // Generate 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000);

//     // Create JWT (15 min expiry)
//     const otpToken = jwt.sign({ otp }, JWT_SECRET, { expiresIn: "15m" });

//     // Save JWT token in user doc
//     foundUser.otp = otpToken;
//     await foundUser.save();

//     // Send email with OTP
//     await transporter.sendMail({
//       from: `"Password Reset" <${process.env.EMAIL_USER}>`,
//       to: foundUser.email,
//       subject: "Your OTP for Password Reset",
//       text: `Your OTP for password reset is ${otp}. It will expire in 15 minutes.`,
//     });

//     return res.status(200).json({
//       message: "OTP sent successfully to your email",
//       role: userRole,
//     });
//   } catch (err) {
//     console.error("Forgot password error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
// exports.forgotPassword = async (req, res) => {
//   const { username, email, mobileNumber } = req.body;

//   try {
//     if (!username && !email && !mobileNumber) {
//       return res.status(400).json({
//         message: "Please provide username, email, or mobileNumber",
//       });
//     }

//     let foundUser = null;
//     let foundProfile = null;
//     let refModelName = null;

//     // 🔹 Case 1: Username provided — find in User collection
//     if (username) {
//       foundUser = await User.findOne({ username });

//       if (!foundUser) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       refModelName = foundUser.refModel;
//       const refId = foundUser.refId;

//       // Load corresponding model dynamically
//       const refModels = {
//         Admin,
//         Instructor,
//         Learner,
//         Owner,
//       };

//       const Model = refModels[refModelName];
//       if (!Model) {
//         return res.status(400).json({ message: "Invalid reference model" });
//       }

//       foundProfile = await Model.findById(refId);
//       if (!foundProfile) {
//         return res.status(404).json({ message: "Referenced profile not found" });
//       }
//     } else {
//       // 🔹 Case 2: No username — search across all role collections by email or mobile
//       const collections = [
//         { model: Admin, name: "Admin" },
//         { model: Instructor, name: "Instructor" },
//         { model: Learner, name: "Learner" },
//         { model: Owner, name: "Owner" },
//       ];

//       for (const { model, name } of collections) {
//         const profile = await model.findOne({
//           $or: [{ email }, { mobileNumber }],
//         });

//         if (profile) {
//           foundProfile = profile;
//           refModelName = name;

//           // Find corresponding User document
//           foundUser = await User.findOne({ refId: profile._id, refModel: name });
//           break;
//         }
//       }
//     }

//     // ❌ Still not found
//     if (!foundUser || !foundProfile) {
//       return res.status(404).json({ message: "User not found in any collection" });
//     }

//     // 🔢 Generate 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000);

//     // 🔐 Create JWT with 15 min expiry
//     const otpToken = jwt.sign({ otp }, JWT_SECRET, { expiresIn: "15m" });

//     // 💾 Save in User document
//     foundUser.otp = otpToken;
//     foundUser.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry timestamp
//     await foundUser.save();

//     // 📧 Send email (we’ll implement SMS later)
//     const mailResult = await sendOtpEmail(foundProfile.email, otp);

//     if (!mailResult.success) {
//       return res.status(500).json({
//         message: "Failed to send OTP email",
//         error: mailResult.error,
//       });
//     }

//     // ✅ Response
//     return res.status(200).json({
//       message: "OTP sent successfully to your registered email",
//       username: foundUser.username,
//       role: foundUser.role,
//       refModel: refModelName,
//       email: foundProfile.email,
//     });
//   } catch (err) {
//     console.error("Forgot password error:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

export const forgotPassword = async (req, res) => {
  const { username } = req.body;
  console.log("username:", username);
  try {
    // 🔹 Step 1: Find user by username
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(404)
        .json({ message: "Username not found in User collection" });

    // 🔹 Step 2: Get model dynamically based on refModel
    const refModel = models[user.refModel];
    if (!refModel)
      return res
        .status(400)
        .json({ message: `Invalid refModel: ${user.refModel}` });

    // 🔹 Step 3: Fetch related user record (to get email/mobile)
    const refDoc = await refModel.findById(user.refId);
    if (!refDoc)
      return res
        .status(404)
        .json({ message: `No record found in ${user.refModel}` });

    // 🔹 Step 4: Generate OTP & token
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpToken = jwt.sign({ otp }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // 🔹 Step 5: Save OTP token in user doc
    user.otp = otpToken;
    user.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // 🔹 Step 6: Send OTP via email
    const emailResult = await sendOtpEmail(refDoc.email, otp);

    if (!emailResult.success)
      return res
        .status(500)
        .json({
          message: "Failed to send OTP email",
          error: emailResult.error,
        });

    // (🔹 Later we can also send OTP via SMS using refDoc.mobileNumber)

    res.status(200).json({
      message: "OTP sent successfully to registered email",
      role: user.refModel,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ============================================================
// 2️⃣ Verify OTP - Decode JWT and Validate
// ============================================================
// export const verifyOtp = async (req, res) => {
//   const { mobileNumber, email, otp } = req.body;

//   try {
//     const collections = [Admin, Instructor, Learner, Owner];
//     let foundUser = null;

//     for (const model of collections) {
//       const user = await model.findOne({
//         $or: [{ mobileNumber }, { email }],
//       });
//       if (user) {
//         foundUser = user;
//         break;
//       }
//     }

//     if (!foundUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (!foundUser.otp) {
//       return res.status(400).json({ message: "No OTP found. Please request again." });
//     }

//     try {
//       const decoded = jwt.verify(foundUser.otp, JWT_SECRET);

//       if (decoded.otp !== parseInt(otp)) {
//         return res.status(400).json({ message: "Invalid OTP" });
//       }

//       // Clear OTP after verification
//       foundUser.otp = null;
//       await foundUser.save();

//       return res.status(200).json({ message: "OTP verified successfully" });
//     } catch (err) {
//       foundUser.otp = null;
//       await foundUser.save();
//       return res.status(400).json({ message: "OTP expired or invalid" });
//     }
//   } catch (err) {
//     console.error("Verify OTP error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

export const verifyOtp = async (req, res) => {
  const { username, otp } = req.body;

  try {
    if (!username || !otp)
      return res.status(400).json({ message: "Username and OTP are required" });

    // 🔹 Step 1: Find user in User collection
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp)
      return res
        .status(400)
        .json({
          message: "OTP not generated or expired. Please request again.",
        });

    // 🔹 Step 2: Verify stored OTP token
    const decoded = jwt.verify(user.otp, JWT_SECRET);

    if (decoded.otp !== Number(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 🔹 Step 3: OTP verified, remove stored OTP
    user.otp = null;
    user.expiresAt = null;
    await user.save();

    // 🔹 Step 4: Generate a temporary reset token (15 min validity)
    const resetToken = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.status(200).json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res
        .status(400)
        .json({ message: "OTP expired. Please request again." });

    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ============================================================
// 3️⃣ Change Password - After OTP Verification
// ============================================================
// export const changePassword = async (req, res) => {
//   const { mobileNumber, email, newPassword } = req.body;

//   try {
//     const collections = [Admin, Instructor, Learner, Owner];
//     let foundUser = null;

//     for (const model of collections) {
//       const user = await model.findOne({
//         $or: [{ mobileNumber }, { email }],
//       });
//       if (user) {
//         foundUser = user;
//         break;
//       }
//     }

//     if (!foundUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     foundUser.password = hashedPassword;
//     await foundUser.save();

//     res.status(200).json({ message: "Password updated successfully" });
//   } catch (err) {
//     console.error("Change password error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

export const changePassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    if (!resetToken || !newPassword)
      return res
        .status(400)
        .json({ message: "Reset token and new password are required" });

    // 🔹 Step 1: Decode token
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    const { username } = decoded;

    // 🔹 Step 2: Find user in User collection
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔹 Step 3: Get correct ref model
    const refModel = models[user.refModel];
    if (!refModel)
      return res
        .status(400)
        .json({ message: `Invalid refModel: ${user.refModel}` });

    // 🔹 Step 4: Fetch referenced document
    const refDoc = await refModel.findById(user.refId);
    if (!refDoc)
      return res
        .status(404)
        .json({ message: `No record found in ${user.refModel}` });

    // 🔹 Step 5: Encrypt new password and update both User & ref model
    // const encryptedPassword = encryptPassword(
    //   newPassword,
    //   JWT_SECRET
    // );

    user.password = newPassword;
    user.otp = null;
    user.expiresAt = null;
    await user.save();

    refDoc.password = newPassword;
    await refDoc.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res
        .status(400)
        .json({ message: "Reset token expired. Please request again." });

    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// changePasswordAfterLogin

export const changePasswordAfterLogin = async (req, res) => {
  const userId = req.user?.id; // Assuming you have middleware to set req.user
  console.log('userId:', userId)
  
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Old password and new password are required." });
  }

  try {
    // 🔹 Step 1: Find logged-in user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";

    // 🔹 Step 2: Compare old password
    const isMatch = comparePasswords(oldPassword, user.password, SECRET_KEY);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }

    // 🔹 Step 3: Encrypt new password
    user.password = newPassword;
    // user.password = encryptPassword(newPassword, SECRET_KEY);

    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password after login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// // Send OTP for password reset
// const forgotPassword = async (req, res) => {
//   const { mobileNumber,email } = req.body;
//   try {
//     const user = await User.findOne({ mobileNumber });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

//     // Update user with OTP and expiration time
//     user.otp = otp;
//     user.expiresAt = expiresAt;
//     await user.save();

//     // Use Fast2SMS to send OTP

//     const response = await fast2sms.sendMessage({
//       authorization: process.env.SMS_API, // Replace with your API key
//       message: `Your OTP for password reset is: ${otp}`,
//       numbers: [mobileNumber],
//     });

// // return
//     if (response.return) {
//       return res.status(200).json({ message: "OTP sent successfully" });
//     } else {
//       throw new Error("Failed to send OTP");
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Verify OTP
// const verifyOtp = async (req, res) => {
//   const { mobileNumber, otp } = req.body;
//   try {
//     const user = await User.findOne({ mobileNumber });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     // Check if OTP is valid
//     if (!user.otp || user.otp !== parseInt(otp)) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     // Check if OTP is expired
//     if (user.expiresAt < Date.now()) {
//       user.otp = null; // Clear expired OTP
//       user.expiresAt = null;
//       await user.save();
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     // OTP is verified; clear the OTP and expiration
//     user.otp = null;
//     user.expiresAt = null;
//     await user.save();

//     res.status(200).json({ message: "OTP verified successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Change Password
// const changePassword = async (req, res) => {
//   const { mobileNumber, newPassword } = req.body;
//   try {
//     const user = await User.findOne({ mobileNumber });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     // Hash the new password using bcryptjs
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;
//     await user.save();

//     res.status(200).json({ message: "Password updated successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// export default { login, logout };
export default { login, logout, forgotPassword, verifyOtp, changePassword,changePasswordAfterLogin}; 
// export default { createUser}
