import express from "express";
import {
  createExpense,
  getBranchExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/branchExpenseController.js";
import jwtAuth from "../middlewares/jwtMiddleware.js";
import ROLE from "../util/roleGroups.js";
import multer from "multer";
import checkSubscription from "../middlewares/checkSubscription.js";
const router = express.Router();

// Multer configuration: store files in memory, max 5 MB
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

/**
 * Only admin-level users can create, view, update, or delete branch expenses.
 * Use "billCopy" as the field name for the single file.
 */
router.post("/", jwtAuth(ROLE.adminLevel),checkSubscription, upload.single("billCopy"), createExpense);
router.get("/branch/:branchId", jwtAuth(ROLE.adminLevel),checkSubscription, getBranchExpenses);
router.get("/:id", jwtAuth(ROLE.adminLevel),checkSubscription, getExpenseById);
router.put("/:id", jwtAuth(ROLE.adminLevel),checkSubscription, upload.single("billCopy"), updateExpense);
router.delete("/:id", jwtAuth(ROLE.adminLevel),checkSubscription, deleteExpense);

export default router;
