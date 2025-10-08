import Subscription from "../models/SubscriptionSchema.js"; // import your Subscription model";


const checkSubscription = async (req, res, next) => {
  try {
    const { organizationId } = req.user; // assuming JWT already attaches org/user info
console.log("Checking subscription for org:", organizationId);

    if (!organizationId) {
      return res.status(401).json({ error: "Organization ID missing in token" ,message:"Organization ID missing in token"});
    }

    // Find active subscription for this org
    const subscription = await Subscription.findOne({
      organizationId,
      status: "paid",
    }).sort({ endedAt: -1 }); // get the latest

    if (!subscription) {
      return res.status(401).json({ error: "No active subscription found", message: "No active subscription found" });
    }

    // Check expiry
    const now = new Date();
    if (subscription.endedAt < now) {
      // Auto update status to expired
      await Subscription.findByIdAndUpdate(subscription._id, { status: "expired" });
      return res.status(401).json({ error: "Subscription expired" ,message:"Subscription expired"});
    }

    // ✅ Subscription is valid → allow API call
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error("Subscription check failed:", error);
    res.status(500).json({ error: "Subscription validation error" });
  }
};

export default checkSubscription;
