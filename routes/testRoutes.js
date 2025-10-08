import express from "express";
import {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest
} from "../controllers/testController.js";
import jwtAuth from "../middlewares/jwtMiddleware.js";
import checkSubscription from "../middlewares/checkSubscription.js";
import ROLE from "../util/roleGroups.js";

const router = express.Router();

router.post("/",jwtAuth(ROLE.adminLevel), checkSubscription,createTest);         // Create test
router.get("/",jwtAuth(ROLE.branchTeam),  checkSubscription,getAllTests);         // Get all tests
router.get("/:id",jwtAuth(ROLE.everyone), checkSubscription,getAllTests);         // Get all tests
router.get("/ById/:id",jwtAuth(ROLE.branchTeam),checkSubscription, getTestById);      // Get test by ID
router.put("/:id", jwtAuth(ROLE.branchTeam),    checkSubscription, updateTest);       // Update test by ID
router.delete("/:id",jwtAuth(ROLE.superUsers),  checkSubscription, deleteTest);    // Delete test by ID

export default router;
