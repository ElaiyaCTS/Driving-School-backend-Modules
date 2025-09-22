import express from 'express';
import {
  createInstructorAttendance,
  getAllInstructorAttendances,
  getInstructorAttendanceById,
  updateInstructorAttendance,
  deleteInstructorAttendance,
} from '../controllers/instructorAttendanceController.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";
import ROLE from '../util/roleGroups.js';
const router = express.Router();

router.post('/',jwtAuth(ROLE.branchTeam), createInstructorAttendance); // Create attendance
router.get('/', jwtAuth(ROLE.everyone),getAllInstructorAttendances); // Get all attendances
router.get('/:id',jwtAuth(ROLE.everyone), getAllInstructorAttendances); // Get attendance by ID
// router.get('/:id',jwtAuth(["Admin","Instructor","Learner"]), getInstructorAttendanceById); // Get attendance by ID
router.put('/:id',jwtAuth(ROLE.branchTeam), updateInstructorAttendance); // Update attendance
router.delete('/:id',jwtAuth(ROLE.superUsers), deleteInstructorAttendance); // Delete attendance

export default router;
