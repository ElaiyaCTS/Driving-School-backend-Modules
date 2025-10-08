import express from 'express';
import {
  createStaffAttendance,
  getAllStaffAttendances,
  getStaffAttendanceById,
  updateStaffAttendance,
  deleteStaffAttendance
} from '../controllers/staffAttendance.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";
import checkSubscription from '../middlewares/checkSubscription.js';
import ROLE from '../util/roleGroups.js';

const router = express.Router();

router.post('/',jwtAuth(ROLE.branchTeam),checkSubscription, createStaffAttendance);
router.get('/', jwtAuth(ROLE.branchTeam), checkSubscription,getAllStaffAttendances);
router.get('/:id', jwtAuth(ROLE.branchTeam),checkSubscription, getAllStaffAttendances);
// router.get('/:id', jwtAuth(ROLE.branchTeam), getStaffAttendanceById);
router.put('/:id', jwtAuth(ROLE.branchTeam), checkSubscription,updateStaffAttendance);
router.delete('/:id', jwtAuth(ROLE.branchTeam), checkSubscription,deleteStaffAttendance);

export default router;
