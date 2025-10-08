import Razorpay from "razorpay";
import crypto from "crypto";
import Subscription from "../models/SubscriptionSchema.js";
import Plan from "../models/Plan.js";
import moment from "moment";

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * 1️⃣ Create Order
 */
export const createOrder = async (req, res) => {
  const organizationId =
    req.user?.organizationId ||
    req.params.organizationId ||
    req.body.organizationId;

  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ error: "Invalid plan" });

    const options = {
      amount: plan.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order || !order.id) {
      return res.status(500).json({ error: "Failed to create order" });
    }

    await Subscription.create({
      organizationId,
      razorpayOrderId: order.id,
      planId: plan._id,
      amount: plan.amount,
      status: "created",
    });

    res.json({
      orderId: order.id,
      amount: plan.amount,
      currency: "INR",
      planId: plan._id,
      planType: plan.type,
      name: plan.name,
      description: plan.description,
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

/**
 * 2️⃣ Verify Payment
 */
export const verifyPayment = async (req, res) => {
  try {
    const { planId, razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await Subscription.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );
      return res
        .status(400)
        .json({ error: "Invalid signature", status: "failed" });
    }

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    const startDate = moment();
    let endedAt;

    switch (plan.type.toLowerCase()) {
      case "monthly":
        endedAt = startDate.clone().add(1, "month");
        break;
      case "quarterly":
        endedAt = startDate.clone().add(3, "months");
        break;
      case "yearly":
        endedAt = startDate.clone().add(1, "year");
        break;
      default:
        endedAt = startDate.clone().add(1, "month");
    }

    await Subscription.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        startedAt: startDate.toDate(),
        endedAt: endedAt.toDate(),
      }
    );

    res.json({ status: "success", startedAt: startDate, endedAt });
  } catch (error) {
    console.error("Verification failed:", error);
    if (req.body.razorpay_order_id) {
      await Subscription.findOneAndUpdate(
        { razorpayOrderId: req.body.razorpay_order_id },
        { status: "failed" }
      );
    }
    res.status(500).json({ error: "Verification failed", status: "failed" });
  }
};

/**
 * 3️⃣ Webhook
 */
export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  try {
    const event = req.body.event;

    if (event === "payment.captured") {
      const { order_id, id: payment_id } = req.body.payload.payment.entity;
      await Subscription.findOneAndUpdate(
        { razorpayOrderId: order_id },
        {
          status: "paid",
          razorpayPaymentId: payment_id,
          paidAt: new Date(),
        }
      );
    }

    if (event === "payment.failed") {
      const { order_id } = req.body.payload.payment.entity;
      await Subscription.findOneAndUpdate(
        { razorpayOrderId: order_id },
        { status: "failed" }
      );
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Webhook handling failed" });
  }
};

/**
 * 4️⃣ Manual fail endpoint (frontend calls when user cancels)
 */
export const markPaymentFailed = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    await Subscription.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { status: "failed", failureReason: reason || "Unknown" }
    );

    res.json({ status: "failed", orderId });
  } catch (error) {
    console.error("Manual failure update error:", error);
    res.status(500).json({ error: "Failed to mark payment as failed" });
  }
};
