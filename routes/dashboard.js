import express from 'express';
import {
  getAdminDashboard,
  getInstructorDashboard,
  getLearnerDashboard
} from '../controllers/dashboardController.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.get('/admin',jwtAuth(["Admin"]), getAdminDashboard);
router.get('/instructor/:id',jwtAuth(["Instructor"]), getInstructorDashboard);
router.get('/learner/:id',jwtAuth(["Learner"]), getLearnerDashboard);

export default router;
