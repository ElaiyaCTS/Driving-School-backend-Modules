import mongoose from "mongoose";

const branchExpenseSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Electronics",
        "Maintenance",
        "Water",
        "Electricity",
        "Rent",
        "Salary",
        "Stationery",
        "Fuel",
        "Others",
      ],
      required: true,
    },
    description: {
      type: String, // optional detailed notes
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
   billCopy: {
      type: String, // single Google Drive file URL
      default: null,
    },

    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Admin",
    // //   required: true,
    // },
  },
  { timestamps: true }
);

export default mongoose.model("BranchExpense", branchExpenseSchema);
