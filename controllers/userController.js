import mongoose from "mongoose";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import {comparePasswords } from '../util/encrypt.js'
import { getUserInfoByRole } from "../util/getUserInfoByRole.js";
import cookie from "cookie";
const isProd = process.env.NODE_ENV === "production";

// login user
const login = async (req, res) => {
  const { username, mobileNumber, password } = req.body; // removed role

  try {
    // 🔹 Find user by username or mobileNumber AND ensure active: true
    const user = await User.findOne({
      $and: [
        { $or: [{ username }, { mobileNumber }] },
        { active: true }
      ]
    });

    if (!user) return res.status(400).json({ message: "User not found or inactive" });

    // 🔹 Verify password
    const isMatch = await comparePasswords(password, user.password, process.env.JWT_SECRET);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // 🔹 Fetch additional user info (role now comes from DB, not request body)
    const userinfo = await getUserInfoByRole(user.role, user.refId);
    if (!userinfo) return res.status(400).json({ message: "User info not found" });

    
    // 4️⃣ Prepare JWT payload (exclude photo for Owner)
    const payload = {
      id: user._id,
      role: user.role,
      user_id: user.refId,
      Name: userinfo.fullName
    };

    if (user.role !== "Owner") {
      payload.photo = userinfo.photo;
    }
  // 🔹 Create JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    // 🔹 Set cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("GDS_Token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        path: "/",
        maxAge: 60 * 60 * 24 // 1 day
      })
    );
     // Prepare response (exclude photo for Owner)
    const responseUser = {
      role: user.role,
      user_id: user.refId,
      Name: userinfo.fullName
    };

    if (user.role !== "Owner") {
      responseUser.photo = userinfo.photo;
    }

    return res.status(200).json({
      message: "Login successful",
      user: responseUser
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server unavailable. Please try again later." });
  }
};


  const logout = (req, res) => {
     
      res.setHeader("Set-Cookie", cookie.serialize("GDS_Token", "", {
       httpOnly: true,
       secure: isProd,
       sameSite: isProd ? "None" : "Lax",
       path: "/",
       expires: new Date(0), // Expire immediately
     }));
     
     
       return res.status(200).json({ message: "Logged out successfully" });
    };
// // Send OTP for password reset
// const forgotPassword = async (req, res) => {
//   const { mobileNumber } = req.body;
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

export default { login,logout};
// export default { login, forgotPassword, verifyOtp, changePassword };
// export default { createUser}
