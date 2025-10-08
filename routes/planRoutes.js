import express from "express";
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from "../controllers/planController.js";

const router = express.Router();

// Create
router.post("/", createPlan);

// Get All
router.get("/", getPlans);

// Get by planId
router.get("/:planId", getPlanById);

// Update by planId
router.put("/:planId", updatePlan);

// Delete by planId
router.delete("/:planId", deletePlan);

export default router;
