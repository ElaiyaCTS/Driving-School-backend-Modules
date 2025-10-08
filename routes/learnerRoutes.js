
import express from "express";
import userController from "../controllers/learnerController.js";
import jwtAuth from "../middlewares/jwtMiddleware.js";
import checkSubscription from '../middlewares/checkSubscription.js';
import multer from "multer";
import ROLE from "../util/roleGroups.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage,
     limits: { fileSize: 5 * 1024 * 1024 }, // ✅ Set file size limit
 });

const fileFields = [
  { name: "photo", maxCount: 1 }, // 🚨 "photo" leaner of "profile"
  { name: "signature", maxCount: 1 },
  { name: "aadharCard", maxCount: 1 },
  { name: "educationCertificate", maxCount: 1 },
  { name: "passport", maxCount: 1 },
  { name: "notary", maxCount: 1 },
]; 

// User creation route (only accessible by Admin)
router.post(
  "/create-Learner",
  upload.fields(fileFields), // Add this middleware
 jwtAuth(ROLE.adminLevel),checkSubscription,
  userController.createLearner
);
// get all data
router.get("/", jwtAuth(ROLE.branchTeam), checkSubscription, userController.getAllLearners);

// get single data
router.get("/:_id", jwtAuth(ROLE.everyone),checkSubscription, userController.getLearnersById);

// UPDATE
router.put("/:admissionNumber",jwtAuth(ROLE.everyone) , checkSubscription,upload.fields(fileFields), userController.updateLearner);

// DELETE
router.delete("/:_id",jwtAuth(ROLE.systemAdmins),checkSubscription, userController.deleteLearner);

export default router;
