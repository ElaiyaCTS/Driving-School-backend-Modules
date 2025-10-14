import express from "express";
import jwtAuth from "../middlewares/jwtMiddleware.js";
import userController from "../controllers/userController.js";
import checkSubscription from "../middlewares/checkSubscription.js";
import moment from "moment";
import Subscription from "../models/SubscriptionSchema.js";
import ROLE from "../util/roleGroups.js";

const router = express.Router();

// user routes
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-otp", userController.verifyOtp);
router.post("/change-password", userController.changePassword);
router.post("/change-password-after-login",jwtAuth(ROLE.everyone), userController.changePasswordAfterLogin);

router.get("/me", jwtAuth(), async (req, res) => {

let subscriptionInfo = null;
const subscription = await Subscription.findOne({
      organizationId: req.user.organizationId,
    }).sort({ endedAt: -1 });

    if (subscription) {
      const isExpired = moment(subscription.endedAt).isBefore(moment());

      // auto-update DB if expired
      if (isExpired && subscription.status !== "expired") {
        await Subscription.findByIdAndUpdate(subscription._id, {
          status: "expired",
        });
      }

      subscriptionInfo = {
        status: isExpired ? "expired" : subscription.status,
        endedAt: subscription.endedAt,
      };
    }

    req.user.subscription = subscriptionInfo;

  res.status(200).json({ user: req.user }); // From decoded JWT
});




export default router;
