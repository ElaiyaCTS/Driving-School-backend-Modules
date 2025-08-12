// routes/adminCombinedRoutes.js

import express from "express";
import exadminRoutes from "../exadminRoutes.js";
import userRoutes from "../UserRouter.js";
import courseRoutes from "../courseRoutes.js";
import courseAssignedRoutes from "../courseAssignedRoutes.js";
import learnerAttendanceRoutes from "../learnerAttendanceRoutes.js";
import instructorAttendanceRoutes from "../instructorAttendanceRoutes.js";
import paymentRoutes from "../paymentRoutes.js";
import testRoutes from "../testRoutes.js";
import staffAttendanceRoutes from "../staffAttendanceRoutes.js";
import staffRouter from "../staffRouter.js";
const router = express.Router();

router.use("/", exadminRoutes);
// router.use("/auth", exadminRoutes);
router.use("/", userRoutes);
router.use('/courses', courseRoutes); 
router.use('/course-assigned', courseAssignedRoutes);
router.use('/learner-attendance', learnerAttendanceRoutes);
router.use('/instructor-attendance', instructorAttendanceRoutes);
router.use("/payments", paymentRoutes);
router.use("/tests", testRoutes);
router.use('/staff', staffRouter);
router.use('/staff-attendance', staffAttendanceRoutes);

export default router;
