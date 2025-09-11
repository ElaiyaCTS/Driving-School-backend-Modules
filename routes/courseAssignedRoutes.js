import express from 'express';
import {
  createCourseAssigned,
  getCourseAssigned,
  getCourseAssignedById,
  updateCourseAssigned,
  deleteCourseAssigned,
} from '../controllers/courseAssignedController.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";
import ROLE from '../util/roleGroups.js';
const router = express.Router();

router.post('/', jwtAuth(ROLE.superUsers),createCourseAssigned);
router.get('/', jwtAuth(ROLE.branchTeam),getCourseAssigned);
router.get('/:_id', jwtAuth(ROLE.branchTeam),getCourseAssigned);
router.get('/ById/:_id',jwtAuth(ROLE.branchTeam), getCourseAssignedById);
router.put('/:_id',jwtAuth(ROLE.adminLevel), updateCourseAssigned);
router.delete('/:_id',jwtAuth(ROLE.superUsers), deleteCourseAssigned);

export default router;
