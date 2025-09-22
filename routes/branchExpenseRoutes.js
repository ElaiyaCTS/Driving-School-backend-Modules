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
router.post("/", jwtAuth(ROLE.adminLevel), upload.single("billCopy"), createExpense);
router.get("/branch/:branchId", jwtAuth(ROLE.adminLevel), getBranchExpenses);
router.get("/:id", jwtAuth(ROLE.adminLevel), getExpenseById);
router.put("/:id", jwtAuth(ROLE.adminLevel), upload.single("billCopy"), updateExpense);
router.delete("/:id", jwtAuth(ROLE.adminLevel), deleteExpense);

export default router;
