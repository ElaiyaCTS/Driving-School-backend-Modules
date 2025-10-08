import express from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";
import checkSubscription from '../middlewares/checkSubscription.js';
import ROLE from '../util/roleGroups.js';
const router = express.Router();

router.post('/', jwtAuth(ROLE.adminLevel),checkSubscription,createCourse);
router.get('/', jwtAuth(ROLE.branchTeam),checkSubscription,getCourses);
router.get('/:_id', jwtAuth(ROLE.everyone), checkSubscription,getCourseById);
router.put('/:_id',jwtAuth(ROLE.adminLevel), checkSubscription,updateCourse);
router.delete('/:_id',jwtAuth(ROLE.systemAdmins),checkSubscription, deleteCourse);

export default router;
