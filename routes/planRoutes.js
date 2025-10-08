import express from "express";
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from "../controllers/planController.js";
import jwtAuth from "../middlewares/jwtMiddleware.js";
import ROLE from "../util/roleGroups.js";
import checkSubscription from "../middlewares/checkSubscription.js";
const router = express.Router();

// Create
router.post("/",jwtAuth(ROLE.systemAdmins),  createPlan);

// Get All
router.get("/",jwtAuth(ROLE.systemAdmins), getPlans);

// Get by planId
router.get("/:planId",jwtAuth(ROLE.systemAdmins), getPlanById);

// Update by planId
router.put("/:planId",jwtAuth(ROLE.systemAdmins), updatePlan);

// Delete by planId
router.delete("/:planId",jwtAuth(ROLE.systemAdmins), deletePlan);

export default router;
