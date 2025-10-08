import Learner from "../models/LearnerSchema.models.js";
import Instructor from "../models/InstructorSchema.models.js";
import Branch from "../models/branchModel.js";
import Payment from "../models/payment.model.js";
import Staff from "../models/StaffSchema.models.js";
import Course from "../models/CourseSchema.models.js";
import CourseAssigned from "../models/CourseAssigned.models.js";
import LearnerAttendance from "../models/Learner_Attendance.models.js";
import InstructorAttendance from "../models/InstructorAttendance.models.js";
import StaffAttendance from "../models/StaffSchema.models.js";
import moment from "moment";
import mongoose from "mongoose";
// export const getOwnerDashboard = async (req, res) => {
//   try {
//     const organizationId = req.user?.organizationId;
//     if (!organizationId) {
//       return res.status(400).json({ success: false, message: "Organization ID missing" });
//     }

//     // Counts (scoped by organization)
//     const totalBranches = await Branch.countDocuments({ organizationId });
//     const totalLearners = await Learner.countDocuments({ organizationId });
//     const totalInstructors = await Instructor.countDocuments({ organizationId });

//     // Revenue grouped by branch & month
//     const revenueData = await Payment.aggregate([
//       { $match: { organizationId } },
//       {
//         $group: {
//           _id: { branch: "$branch", month: { $month: "$createdAt" } },
//           total: { $sum: "$amount" },
//         },
//       },
//       {
//         $lookup: {
//           from: "branches",
//           localField: "_id.branch",
//           foreignField: "_id",
//           as: "branchDetails",
//         },
//       },
//       {
//         $project: {
//           branch: { $arrayElemAt: ["$branchDetails.name", 0] },
//           month: "$_id.month",
//           total: 1,
//         },
//       },
//       { $sort: { month: 1 } },
//     ]);

//     res.json({
//       success: true,
//       stats: {
//         totalBranches,
//         totalLearners,
//         totalInstructors,
//       },
//       revenueData,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getOwnerDashboard = async (req, res) => {
//   try {
//     const organizationId = req.user?.organizationId;
//     console.log('organizationId:', organizationId)

//     if (!organizationId) {
//       return res.status(400).json({ success: false, message: "Organization ID missing" });
//     }

//     // Counts
//     const totalBranches = await Branch.countDocuments({ organizationId });
//     const totalLearners = await Learner.countDocuments({ organizationId });
//     const totalInstructors = await Instructor.countDocuments({ organizationId });

//     // Revenue grouped by branch & month (using "date" field)
//     const revenueData = await Payment.aggregate([
//       { $match: { organizationId } },
//       {
//         $group: {
//           _id: { branchId: "$branchId", month: { $month: "$date" }, year: { $year: "$date" } },
//           total: { $sum: "$amount" },
//         },
//       },
//       {
//         $lookup: {
//           from: "branches",
//           localField: "_id.branchId",
//           foreignField: "_id",
//           as: "branchDetails",
//         },
//       },
//       {
//         $project: {
//           branch: { $arrayElemAt: ["$branchDetails.name", 0] },
//           month: "$_id.month",
//           year: "$_id.year",
//           total: 1,
//         },
//       },
//       { $sort: { year: 1, month: 1 } },
//     ]);

//     res.json({
//       success: true,
//       stats: {
//         totalBranches,
//         totalLearners,
//         totalInstructors,
//       },
//       revenueData,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getOwnerDashboard = async (req, res) => {
//   try {
//     const organizationId = req.user?.organizationId;
//     if (!organizationId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Organization ID missing" });
//     }

//     // Convert to ObjectId
//     const orgObjectId = new mongoose.Types.ObjectId(organizationId);

//     // Counts
//     const totalBranches = await Branch.countDocuments({
//       organizationId: orgObjectId,
//     });
//     const totalLearners = await Learner.countDocuments({
//       organizationId: orgObjectId,
//     });
//     const totalInstructors = await Instructor.countDocuments({
//       organizationId: orgObjectId,
//     });

//     // Revenue grouped by branch & month
//     // const revenueData = await Payment.aggregate([
//     //   { $match: { organizationId: orgObjectId } }, // ✅ FIXED
//     //   {
//     //     $group: {
//     //       _id: {
//     //         branchId: "$branchId",
//     //         month: { $month: "$date" },
//     //         year: { $year: "$date" }
//     //       },
//     //       total: { $sum: "$amount" }
//     //     }
//     //   },
//     //   {
//     //     $lookup: {
//     //       from: "branches",
//     //       localField: "_id.branchId",
//     //       foreignField: "_id",
//     //       as: "branchDetails"
//     //     }
//     //   },
//     //   {
//     //     $project: {
//     //       branch: { $arrayElemAt: ["$branchDetails.name", 0] },
//     //       month: "$_id.month",
//     //       year: "$_id.year",
//     //       total: 1
//     //     }
//     //   },
//     //   { $sort: { year: 1, month: 1 } }
//     // ]);
//     const revenueData = await Payment.aggregate([
//       { $match: { organizationId: orgObjectId } },
//       {
//         $group: {
//           _id: {
//             branchId: "$branchId",
//             month: { $month: "$date" },
//             year: { $year: "$date" },
//           },
//           total: { $sum: "$amount" },
//         },
//       },
//       {
//         $lookup: {
//           from: "branches",
//           localField: "_id.branchId",
//           foreignField: "_id",
//           as: "branchDetails",
//         },
//       },
//       {
//         $project: {
//           branchId: "$_id.branchId",
//           branch: { $arrayElemAt: ["$branchDetails.name", 0] },
//           month: "$_id.month",
//           year: "$_id.year",
//           total: 1,
//         },
//       },
//       { $sort: { year: 1, month: 1 } },
//     ]);
//     res.json({
//       success: true,
//       stats: { totalBranches, totalLearners, totalInstructors },
//       revenueData,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// export const getOwnerDashboard = async (req, res) => {
//   try {
//     const organizationId = req.user?.organizationId;
//     if (!organizationId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Organization ID missing" });
//     }

//     const orgObjectId = new mongoose.Types.ObjectId(organizationId);

//     // ✅ Stats
//     const totalBranches = await Branch.countDocuments({ organizationId: orgObjectId });
//     const totalLearners = await Learner.countDocuments({ organizationId: orgObjectId });
//     const totalInstructors = await Instructor.countDocuments({ organizationId: orgObjectId });

//     // ✅ Branch-wise revenue with branch name
//     const revenueData = await Payment.aggregate([
//   { $match: { organizationId: orgObjectId } },
//   {
//     $group: {
//       _id: {
//         branchId: "$branchId",
//         month: { $month: "$date" },
//         year: { $year: "$date" },
//       },
//       total: { $sum: "$amount" },
//     },
//   },
//   {
//     $lookup: {
//       from: "branches", // Collection name in MongoDB
//       localField: "_id.branchId",
//       foreignField: "_id",
//       as: "branchDetails",
//     },
//   },
//   {
//     $project: {
//       branchId: "$_id.branchId",
//       branchName: { $arrayElemAt: ["$branchDetails.name", 0] }, // ✅ add branch name
//       month: "$_id.month",
//       year: "$_id.year",
//       total: 1,
//     },
//   },
//   { $sort: { year: 1, month: 1 } },
// ]);

//     res.json({
//       success: true,
//       stats: {
//         totalBranches,
//         totalLearners,
//         totalInstructors,
//       },
//       revenueData,
//     });
//   } catch (error) {
//     console.error("Dashboard Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
import { handleErrorResponse } from "../util/errorHandler.js";



export const getOwnerDashboard = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res
        .status(400)
        .json({ success: false, message: "Organization ID missing" });
    }

    const orgObjectId = new mongoose.Types.ObjectId(organizationId);

    // ✅ Stats
    const totalBranches = await Branch.countDocuments({ organizationId: orgObjectId });
    const totalLearners = await Learner.countDocuments({ organizationId: orgObjectId });
    const totalInstructors = await Instructor.countDocuments({ organizationId: orgObjectId });

    // ✅ Branch-wise revenue with branchName
    const revenueData = await Payment.aggregate([
      { $match: { organizationId: orgObjectId } },
      {
        $group: {
          _id: {
            branchId: "$branchId",
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "_id.branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      {
        $project: {
          branchId: "$_id.branchId",
          branchName: { $arrayElemAt: ["$branchDetails.branchName", 0] }, // ✅ FIXED FIELD
          month: "$_id.month",
          year: "$_id.year",
          total: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

   // ✅ Yearly revenue (all branches combined)
    const yearlyRevenue = await Payment.aggregate([
      { $match: { organizationId: orgObjectId } },
      {
        $group: {
          _id: { year: { $year: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          year: "$_id.year",
          total: 1,
          _id: 0,
        },
      },
      { $sort: { year: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalBranches,
        totalLearners,
        totalInstructors,
      },
      revenueData,
      yearlyRevenue,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    handleErrorResponse(res, error);
    // res.status(500).json({ success: false, message: error.message });
  }
};

/** 📊 Admin Dashboard */
export const getAdminDashboard = async (req, res) => {
  try {
    const branchId = req.branchId || req.params.branchId;
    const organizationId =
      req.user?.organizationId || req.params.organizationId;
    if (!branchId) {
      return res
        .status(401)
        .json({ message: "Branch ID is required for this endpoint" });
    }
    if (!organizationId) {
      return res.status(401).json({ message: "Organization ID is required" });
    }

    const filter = { organizationId, branchId };
    const totalLearners = await Learner.countDocuments(filter);
    // const activeLearners = await Learner.countDocuments({ status: 'active' });
    // const inactiveLearners = totalLearners - activeLearners;
    const instructors = await Instructor.countDocuments(filter);
    const staff = await Staff.countDocuments(filter);
    const courses = await Course.countDocuments(filter);

    // Monthly learner registrations (Jan–Dec)
    const months = moment.monthsShort(); // ['Jan', 'Feb', ..., 'Dec']
    const monthlyAdmissions = await Promise.all(
      months.map(async (month, index) => {
        const start = moment().month(index).startOf("month");
        const end = moment().month(index).endOf("month");

        const count = await Learner.countDocuments({
          createdAt: { $gte: start.toDate(), $lte: end.toDate() },
        });

        return { month, count };
      })
    );

    res.json({
      totalLearners,
      // activeLearners,
      // inactiveLearners,
      instructors,
      staff,
      courses,
      monthlyAdmissions,
    });
  } catch (err) {
    console.error("[AdminDashboard]", err);
    res.status(500).json({ error: "Server error" });
  }
};

/** 👨‍🏫 Instructor Dashboard */
export const getInstructorDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    const assignedLearners = await Learner.countDocuments({ instructor: id });

    const attendanceMarked = await InstructorAttendance.countDocuments({
      instructorId: id,
    });

    const upcomingClasses = await InstructorAttendance.countDocuments({
      instructorId: id,
      date: { $gte: new Date() },
    });

    res.json({
      assignedLearners,
      upcomingClasses,
      attendanceMarked,
    });
  } catch (err) {
    console.error("[InstructorDashboard]", err);
    res.status(500).json({ error: "Server error" });
  }
};

/** 🎓 Learner Dashboard */
export const getLearnerDashboard = async (req, res) => {
  const branchId = req.branchId || req.params.branchId;
  const organizationId = req.user?.organizationId || req.params.organizationId;
  if (!branchId) {
    return res
      .status(401)
      .json({ message: "Branch ID is required for this endpoint" });
  }
  if (!organizationId) {
    return res.status(401).json({ message: "Organization ID is required" });
  }

  try {
    const { id } = req.params;
    const filter = { learner: id, organizationId, branchId };

    // Fetch all assigned courses for learner
    const assignedCourses = await CourseAssigned.find(filter);

    const totalCourse = assignedCourses.length;

    const completedCourses = assignedCourses.filter(
      (course) => course.statusOne === "Completed"
    );

    const activeCourses = assignedCourses.filter(
      (course) => course.statusOne !== "Completed"
    );

    const CompletedCourse = completedCourses.length;
    const ActiveCourse = activeCourses.length;

    // Get course IDs of active courses
    const activeCourseIds = activeCourses.map((c) => c.course);

    // Fetch course details for active courses
    const activeCourseDetails = await Course.find({
      _id: { $in: activeCourseIds },
    });

    //  return
    // Calculate total classes only from active courses
    let ActiveClasses = 0;
    for (const course of activeCourseDetails) {
      const theory = course.theoryDays || 0;
      const practical = course.practicalDays || 0;
      ActiveClasses += theory + practical;
    }

    // Attendance counts only for active courses
    const attendedClasses = await LearnerAttendance.countDocuments({
      learner: id,
      courseType: { $in: activeCourseIds },
    });

    // return
    const upcomingClasses = ActiveClasses - attendedClasses;

    return res.json({
      totalCourse: totalCourse.toString(),
      CompletedCourse: CompletedCourse.toString(),
      ActiveCourse: ActiveCourse.toString(),
      ActiveClasses,
      attendedClasses,
      upcomingClasses,
    });
  } catch (err) {
    console.error("[LearnerDashboard]", err);
    res.status(500).json({ error: "Server error" });
  }
};
