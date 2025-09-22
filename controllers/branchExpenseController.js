import BranchExpense from "../models/BranchExpenseSchema.models.js";
import { uploadExpensesFile, deleteExpenseFile } from "../util/googleDriveUpload.js";

/**
 * CREATE a new expense
 */
export const createExpense = async (req, res) => {
  let uploadedFileData = null;
  try {
    const branchId = req.branchId || req.params.branchId;
    const organizationId = req.user?.organizationId || req.params.organizationId;

    if (!branchId) return res.status(401).json({ message: "Branch ID is required" });
    if (!organizationId) return res.status(401).json({ message: "Organization ID is required" });

    const { category, description, amount } = req.body;

    if (req.file) {
      uploadedFileData = await uploadExpensesFile(req.file);
    }

    const expense = await BranchExpense.create({
      organizationId,
      branch: branchId,
      category,
      description,
      amount,
      billCopy: uploadedFileData ? uploadedFileData.webViewLink : null,
    //   createdBy: req.user._id,
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    if (uploadedFileData?.id) {
      await deleteExpenseFile(uploadedFileData.id);
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET all expenses for a branch
 */
export const getBranchExpenses = async (req, res) => {
  try {
    const branchId = req.branchId || req.params.branchId;
    const organizationId = req.user?.organizationId || req.params.organizationId;

    if (!branchId) return res.status(401).json({ message: "Branch ID is required" });
    if (!organizationId) return res.status(401).json({ message: "Organization ID is required" });

    const expenses = await BranchExpense.find({ branch: branchId }).sort({ createdAt: -1 });
    res.json({ success: true, expenses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET single expense by ID
 */
export const getExpenseById = async (req, res) => {
  try {
    const branchId = req.branchId || req.params.branchId;
    const organizationId = req.user?.organizationId || req.params.organizationId;

    if (!branchId) return res.status(401).json({ message: "Branch ID is required" });
    if (!organizationId) return res.status(401).json({ message: "Organization ID is required" });

    const { id } = req.params;
    const expense = await BranchExpense.findOne({ _id: id, branch: branchId });

    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

    res.json({ success: true, expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE an expense (overwrite Drive file if uploaded)
 */
export const updateExpense = async (req, res) => {
  let uploadedFileData = null;
  try {
    const branchId = req.branchId || req.params.branchId;
    const organizationId = req.user?.organizationId || req.params.organizationId;

    if (!branchId) return res.status(401).json({ message: "Branch ID is required" });
    if (!organizationId) return res.status(401).json({ message: "Organization ID is required" });

    const { id } = req.params;
    const expense = await BranchExpense.findById(id);
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

    // Upload new bill file if provided
    if (req.file) {
      uploadedFileData = await uploadExpensesFile(req.file);
      expense.billCopy = uploadedFileData.webViewLink;
    }

    // Update other fields
    const { category, description, amount } = req.body;
    if (category) expense.category = category;
    if (description) expense.description = description;
    if (amount) expense.amount = amount;

    // Ensure branchId and organizationId cannot be changed
    expense.branch = branchId;
    expense.organizationId = organizationId;

    await expense.save();
    res.json({ success: true, expense });
  } catch (error) {
    if (uploadedFileData?.id) {
      await deleteExpenseFile(uploadedFileData.id);
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE an expense
 */
export const deleteExpense = async (req, res) => {
  try {
    const branchId = req.branchId || req.params.branchId;
    const organizationId = req.user?.organizationId || req.params.organizationId;

    if (!branchId) return res.status(401).json({ message: "Branch ID is required" });
    if (!organizationId) return res.status(401).json({ message: "Organization ID is required" });

    const { id } = req.params;
    const expense = await BranchExpense.findOne({ _id: id, branch: branchId });
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

    await expense.deleteOne();
    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
