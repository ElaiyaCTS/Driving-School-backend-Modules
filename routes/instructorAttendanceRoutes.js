import express from 'express';
import {
  createInstructorAttendance,
  getAllInstructorAttendances,
  getInstructorAttendanceById,
  updateInstructorAttendance,
  deleteInstructorAttendance,
} from '../controllers/instructorAttendanceController.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";
import checkSubscription from '../middlewares/checkSubscription.js';
import ROLE from '../util/roleGroups.js';
const router = express.Router();

router.post('/',jwtAuth(ROLE.branchTeam),checkSubscription, createInstructorAttendance); // Create attendance
router.get('/', jwtAuth(ROLE.everyone),  checkSubscription, getAllInstructorAttendances); // Get all attendances
router.get('/:id',jwtAuth(ROLE.everyone),checkSubscription, getAllInstructorAttendances); // Get attendance by ID
// router.get('/:id',jwtAuth(["Admin","Instructor","Learner"]), getInstructorAttendanceById); // Get attendance by ID
router.put('/:id',jwtAuth(ROLE.branchTeam),    checkSubscription,updateInstructorAttendance); // Update attendancecheckSubscription,
router.delete('/:id',jwtAuth(ROLE.superUsers), checkSubscription,deleteInstructorAttendance); // Delete attendance

export default router;
