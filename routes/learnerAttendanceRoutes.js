import express from 'express';
import { createAttendance, getAllAttendances, getAttendanceById, updateAttendance, deleteAttendance } from '../controllers/learnerAttendanceController.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";
import checkSubscription from '../middlewares/checkSubscription.js';
import ROLE from '../util/roleGroups.js';

const router = express.Router();
router.post('/', jwtAuth(ROLE.branchTeam)  ,checkSubscription,createAttendance);
router.get('/', jwtAuth(ROLE.branchTeam)   ,checkSubscription,getAllAttendances); 
router.get('/:id', jwtAuth(ROLE.everyone)  ,checkSubscription,getAllAttendances); 
router.get('/createdBy/:createdBy', jwtAuth(ROLE.branchTeam),checkSubscription,getAllAttendances); 
// router.get('/:id',jwtAuth(["Admin","Instructor","Learner"]), getAttendanceById);
router.put('/:id',jwtAuth(ROLE.branchTeam),    checkSubscription,updateAttendance);
router.delete('/:id',jwtAuth(ROLE.superUsers), checkSubscription, deleteAttendance);

export default router;
