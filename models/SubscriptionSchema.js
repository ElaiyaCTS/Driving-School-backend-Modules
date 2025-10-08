
// backend/models/SubscriptionSchema.js
import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "organization" },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: null },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    amount: { type: Number, required: true },
    status: { type: String, default: "created" },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 🔹 Middleware to shift UTC → IST on save
SubscriptionSchema.pre("save", function (next) {
  const offset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms

  if (this.createdAt) this.createdAt = new Date(this.createdAt.getTime() + offset);
  if (this.updatedAt) this.updatedAt = new Date(this.updatedAt.getTime() + offset);
  if (this.endedAt) this.endedAt = new Date(this.endedAt.getTime() + offset);

  next();
});

// 🔹 Middleware to shift UTC → IST on update (findOneAndUpdate)
SubscriptionSchema.pre("findOneAndUpdate", function (next) {
  const offset = 5.5 * 60 * 60 * 1000;

  const update = this.getUpdate();

  if (update.createdAt) update.createdAt = new Date(update.createdAt.getTime() + offset);
  if (update.updatedAt) update.updatedAt = new Date(update.updatedAt.getTime() + offset);
  if (update.endedAt) update.endedAt = new Date(update.endedAt.getTime() + offset);

  this.setUpdate(update);
  next();
});

export default mongoose.model("Subscription", SubscriptionSchema);

