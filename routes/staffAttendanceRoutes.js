import express from 'express';
import {
  createStaffAttendance,
  getAllStaffAttendances,
  getStaffAttendanceById,
  updateStaffAttendance,
  deleteStaffAttendance
} from '../controllers/staffAttendance.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";
import ROLE from '../util/roleGroups.js';

const router = express.Router();

router.post('/',jwtAuth(ROLE.branchTeam), createStaffAttendance);
router.get('/', jwtAuth(ROLE.branchTeam), getAllStaffAttendances);
router.get('/:id', jwtAuth(ROLE.branchTeam), getAllStaffAttendances);
// router.get('/:id', jwtAuth(ROLE.branchTeam), getStaffAttendanceById);
router.put('/:id', jwtAuth(ROLE.branchTeam), updateStaffAttendance);
router.delete('/:id', jwtAuth(ROLE.branchTeam), deleteStaffAttendance);

export default router;
