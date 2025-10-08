import express from 'express';
import {
  getAdminDashboard,
  getInstructorDashboard,
  getLearnerDashboard,
  getOwnerDashboard
} from '../controllers/dashboardController.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";
import checkSubscription from '../middlewares/checkSubscription.js';
import ROLE from '../util/roleGroups.js';
const router = express.Router();

router.get('/organization',jwtAuth(ROLE.superUsers), checkSubscription,getOwnerDashboard);
router.get('/admin',jwtAuth(ROLE.adminLevel),checkSubscription, getAdminDashboard);
router.get('/instructor/:id',jwtAuth(ROLE.branchTeam),checkSubscription, getInstructorDashboard);
router.get('/learner/:id',jwtAuth(ROLE.learnerLevel), checkSubscription,getLearnerDashboard);

export default router;
