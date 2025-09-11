import express from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import jwtAuth from "../middlewares/jwtMiddleware.js";
import ROLE from '../util/roleGroups.js';
const router = express.Router();

router.post('/', jwtAuth(ROLE.adminLevel),createCourse);
router.get('/', jwtAuth(ROLE.branchTeam),getCourses);
router.get('/:_id', jwtAuth(ROLE.everyone), getCourseById);
router.put('/:_id',jwtAuth(ROLE.adminLevel), updateCourse);
router.delete('/:_id',jwtAuth(ROLE.systemAdmins), deleteCourse);

export default router;
