import express from 'express';
import {
  createCourseAssigned,
  getCourseAssigned,
  getCourseAssignedById,
  updateCourseAssigned,
  deleteCourseAssigned,
} from '../controllers/courseAssignedController.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";
import checkSubscription from '../middlewares/checkSubscription.js';
import ROLE from '../util/roleGroups.js';
const router = express.Router();

router.post('/', jwtAuth(ROLE.superUsers),checkSubscription,createCourseAssigned);
router.get('/', jwtAuth(ROLE.branchTeam),checkSubscription,getCourseAssigned);
router.get('/:_id', jwtAuth(ROLE.everyone),checkSubscription,getCourseAssigned);
router.get('/ById/:_id',jwtAuth(ROLE.branchTeam),checkSubscription, getCourseAssignedById);
router.put('/:_id',jwtAuth(ROLE.adminLevel),checkSubscription, updateCourseAssigned);
router.delete('/:_id',jwtAuth(ROLE.superUsers),checkSubscription, deleteCourseAssigned);

export default router;
