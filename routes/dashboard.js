import express from 'express';
import {
  getAdminDashboard,
  getInstructorDashboard,
  getLearnerDashboard
} from '../controllers/dashboardController.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";
import ROLE from '../util/roleGroups.js';
const router = express.Router();

router.get('/admin',jwtAuth(ROLE.adminLevel), getAdminDashboard);
router.get('/instructor/:id',jwtAuth(ROLE.branchTeam), getInstructorDashboard);
router.get('/learner/:id',jwtAuth(ROLE.learnerLevel), getLearnerDashboard);

export default router;
