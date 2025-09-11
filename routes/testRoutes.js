import express from "express";
import {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest
} from "../controllers/testController.js";
import jwtAuth from "../middlewares/jwtMiddleware.js";
import ROLE from "../util/roleGroups.js";

const router = express.Router();

router.post("/",jwtAuth(ROLE.adminLevel), createTest);         // Create test
router.get("/",jwtAuth(ROLE.branchTeam), getAllTests);         // Get all tests
router.get("/:id",jwtAuth(ROLE.everyone), getAllTests);         // Get all tests
router.get("/ById/:id",jwtAuth(ROLE.branchTeam), getTestById);      // Get test by ID
router.put("/:id", jwtAuth(ROLE.branchTeam),updateTest);       // Update test by ID
router.delete("/:id",jwtAuth(ROLE.superUsers), deleteTest);    // Delete test by ID

export default router;
