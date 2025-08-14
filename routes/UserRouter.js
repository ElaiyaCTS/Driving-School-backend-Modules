import express from "express";
import jwtAuth from "../middlewares/jwtMiddleware.js";
import userController from "../controllers/userController.js";

const router = express.Router();

// user routes
router.post("/login", userController.login);
router.post("/logout", userController.logout);

router.get("/me", jwtAuth(), (req, res) => {
  res.status(200).json({ user: req.user }); // From decoded JWT
});

// router.post("/forgot-password", userController.forgotPassword);
// router.post("/verify-otp", userController.verifyOtp);
// router.post("/change-password", userController.changePassword);



export default router;
