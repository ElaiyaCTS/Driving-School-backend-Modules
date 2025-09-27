// routes/adminCombinedRoutes.js

import express from "express";
// import exadminRoutes from "../exadminRoutes.js";
// import userRoutes from "./UserRouter.js";
// import imageProxyRoutes from './imageProxyRoutes.js';
import ownerRoutes from './ownerRoutes.js';
import courseRoutes from "./courseRoutes.js";
import courseAssignedRoutes from "./courseAssignedRoutes.js";
import learnerAttendanceRoutes from "./learnerAttendanceRoutes.js";
import instructorAttendanceRoutes from "./instructorAttendanceRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import testRoutes from "./testRoutes.js";
import staffAttendanceRoutes from "./staffAttendanceRoutes.js";
import staffRouter from "./staffRouter.js";
import dashboardRoutes from './dashboard.js';
import branchRoutes from './branchRoutes.js';
import adminRoutes from './adminRoutes.js';
import instructorRoutes from './instructorRoutes.js';
import learnerRoutes from './learnerRoutes.js';
import branchExpenseRoutes from './branchExpenseRoutes.js';
import ROLE from '../util/roleGroups.js';
import jwtAuth  from '../middlewares/jwtMiddleware.js';



const router = express.Router();

// Helper to register shared routes
const registerRoleRoutes = (roleRouter) => {
//   roleRouter.use("/", userRoutes);
  roleRouter.use('/organization', ownerRoutes);
  roleRouter.use('/admins', adminRoutes);// Admin routes
  roleRouter.use('/branches', branchRoutes);
  roleRouter.use('/dashboard', dashboardRoutes);
  roleRouter.use("/instructor", instructorRoutes);
  roleRouter.use("/learner", learnerRoutes);
  roleRouter.use("/expenses", branchExpenseRoutes);
  roleRouter.use("/courses", courseRoutes);
  roleRouter.use("/course-assigned", courseAssignedRoutes);
  roleRouter.use("/learner-attendance", learnerAttendanceRoutes);
  roleRouter.use("/instructor-attendance", instructorAttendanceRoutes);
  roleRouter.use("/payments", paymentRoutes);
  roleRouter.use("/tests", testRoutes);
  roleRouter.use('/staff', staffRouter);
  roleRouter.use('/staff-attendance', staffAttendanceRoutes);
  roleRouter.use('/staff-attendance', staffAttendanceRoutes);

};


// Owner routes
const ownerRouter = express.Router();
registerRoleRoutes(ownerRouter);
router.use("/v1", ownerRouter);

// Instructor routes
const instructorRouter = express.Router();
registerRoleRoutes(instructorRouter);
router.use("/v2", instructorRouter);

// Learner routes
const learnerRouter = express.Router();
registerRoleRoutes(learnerRouter);
router.use("/v3", learnerRouter);

export default router;
