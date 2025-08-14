
import express from "express";
import userController from "../controllers/learnerController.js";
import jwtAuth from "../middlewares/jwtMiddleware.js";
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
 jwtAuth(ROLE.superUsers),
  userController.createLearner
);
// get all data
router.get("/learners", jwtAuth(ROLE.branchTeam), userController.getAllLearners);

// get single data
router.get("/learner/:_id", jwtAuth(ROLE.everyone), userController.getLearnersById);

// UPDATE
router.put("/learner/:admissionNumber",jwtAuth(ROLE.everyone),upload.fields(fileFields), userController.updateLearner);

// DELETE
router.delete("/learner/:_id",jwtAuth(ROLE.systemAdmins), userController.deleteLearner);

export default router;
