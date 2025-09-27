import BranchExpense from "../models/BranchExpenseSchema.models.js";
import { uploadExpensesFile, deleteExpenseFile } from "../util/googleDriveUpload.js";
import mongoose from "mongoose";
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
// export const getBranchExpenses = async (req, res) => {
//   try {
//     const branchId = req.branchId || req.params.branchId;
//     const organizationId = req.user?.organizationId || req.params.organizationId;

//     if (!branchId) return res.status(401).json({ message: "Branch ID is required" });
//     if (!organizationId) return res.status(401).json({ message: "Organization ID is required" });

//     const expenses = await BranchExpense.find({ branch: branchId }).sort({ createdAt: -1 });
//     res.json({ success: true, expenses });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// export const getBranchExpenses = async (req, res) => {
//   try {
//     const branchId = req.branchId || req.params.branchId;
//     const organizationId = req.user?.organizationId || req.params.organizationId;

//     if (!branchId) return res.status(400).json({ success: false, message: "Branch ID is required" });
//     if (!organizationId) return res.status(400).json({ success: false, message: "Organization ID is required" });

//     // ✅ Query params
//     const {
//       search = "",         // category/description/amount text search
//       fromDate,            // e.g. 2025-09-01
//       toDate,              // e.g. 2025-09-22
//       page = 1,
//       limit = 10
//     } = req.query;

//     const query = {
//       branch: branchId,
//       organizationId
//     };

//     // 🔎 Search by category, description, or amount
//     if (search.trim()) {
//       const regex = new RegExp(search, "i"); // case-insensitive
//       query.$or = [
//         { category: regex },
//         { description: regex },
//         // If user types a number, allow amount matching
//         ...(isNaN(Number(search)) ? [] : [{ amount: Number(search) }])
//       ];
//     }

//     // 📅 Date range filter on createdAt
//     if (fromDate || toDate) {
//       query.createdAt = {};
//       if (fromDate) query.createdAt.$gte = new Date(fromDate);
//       if (toDate) {
//         const end = new Date(toDate);
//         end.setHours(23, 59, 59, 999); // include full day
//         query.createdAt.$lte = end;
//       }
//     }

//     // Pagination
//     const pageNum = Math.max(parseInt(page), 1);
//     const pageSize = Math.max(parseInt(limit), 1);
//     const skip = (pageNum - 1) * pageSize;

//     const [expenses, total] = await Promise.all([
//       BranchExpense.find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(pageSize),
//       BranchExpense.countDocuments(query)
//     ]);

//     res.json({
//       success: true,
//       total,
//       page: pageNum,
//       limit: pageSize,
//       pages: Math.ceil(total / pageSize),
//       expenses
//     });
//   } catch (error) {
//     console.error("getBranchExpenses error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// ✅ GET /api/v1/expenses/branch/:branchId
export const getBranchExpenses = async (req, res) => {
  try {
    const branchId = req.branchId || req.params.branchId;
    const organizationId = req.user?.organizationId || req.params.organizationId;

    if (!branchId) return res.status(400).json({ success: false, message: "Branch ID is required" });
    if (!organizationId) return res.status(400).json({ success: false, message: "Organization ID is required" });

    // ✅ Accept frontend query params
    const {
        category="",  // filter by category
      search = "",
      from = "",     // ✅ keep same as frontend
      to = "",
      page = 1,
      limit = 10
    } = req.query;

    const query = { branch: branchId, organizationId };

    // 🔎 Search by category, description, or amount
    if (search.trim()) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { category: regex },
        { description: regex },
        ...(isNaN(Number(search)) ? [] : [{ amount: Number(search) }])
      ];
    }

    if(category){
      query.category = category;
    }

    // 📅 Date range
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const pageNum = Math.max(parseInt(page), 1);
    const pageSize = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * pageSize;

    const [expenses, total] = await Promise.all([
      BranchExpense.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      BranchExpense.countDocuments(query)
    ]);

    res.json({
      success: true,
      expenses,
      total,
      totalPages: Math.ceil(total / pageSize),
      page: pageNum
    });
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
