import express from 'express';
import { createAttendance, getAllAttendances, getAttendanceById, updateAttendance, deleteAttendance } from '../controllers/learnerAttendanceController.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";
import ROLE from '../util/roleGroups.js';

const router = express.Router();
router.post('/', jwtAuth(ROLE.branchTeam),createAttendance);
router.get('/', jwtAuth(ROLE.branchTeam),getAllAttendances); 
router.get('/:id', jwtAuth(ROLE.everyone),getAllAttendances); 
router.get('/createdBy/:createdBy', jwtAuth(ROLE.branchTeam),getAllAttendances); 
// router.get('/:id',jwtAuth(["Admin","Instructor","Learner"]), getAttendanceById);
router.put('/:id',jwtAuth(ROLE.branchTeam), updateAttendance);
router.delete('/:id',jwtAuth(ROLE.superUsers), deleteAttendance);

export default router;
