import express from "express";
import {
  createOrder,
  verifyPayment,
  razorpayWebhook,
  markPaymentFailed,
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/verify", verifyPayment);
router.post("/webhook", express.json({ type: "*/*" }), razorpayWebhook);
router.post("/failed", markPaymentFailed); // ← called by frontend if user cancels

export default router;
