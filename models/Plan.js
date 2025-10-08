import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    // planId: {
    //   type: String,
    //   required: true,
    //   unique: true, // like "plan_monthly"
    // },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number, // store numeric (999), not ₹999
      required: true,
    },
    type: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"], // extend if needed
      required: true,
    },
    days: {
      type: Number,
      required: true,
    min: [14, 'Days must be at least 14 days'],
    },
    // Add more fields as needed, e.g., features, limits, etc.
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", PlanSchema);
