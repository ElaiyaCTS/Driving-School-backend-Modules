
import express from "express";
// import exadminController from "../controllers/exadminController.js";
import userController from "../controllers/InstructorController.js";
import jwtAuth from "../middlewares/jwtMiddleware.js";
import checkSubscription from '../middlewares/checkSubscription.js';
import multer from "multer";
import ROLE from "../util/roleGroups.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage,
     limits: { fileSize: 5 * 1024 * 1024 }, // ✅ Set file size limit
 });


const fileFieldsInstead = [
  { name: "photo", maxCount: 1 }, // 🚨 "photo" instead of "profile"
];

router.post(
  "/create-Instructor",jwtAuth(ROLE.everyone),checkSubscription,
  upload.fields(fileFieldsInstead), // Add this middleware
  userController.createInstructor
);
// get all data
router.get("/",jwtAuth(ROLE.everyone),      checkSubscription,        userController.getAllInstructors);

// get single data
router.get("/:_id",jwtAuth(ROLE.everyone),     checkSubscription,      userController.getInstructorById);

// UPDATE
router.put("/:instructorId",jwtAuth(ROLE.everyone),checkSubscription,  upload.fields(fileFieldsInstead),userController.updateInstructor);

// DELETE
router.delete("/:_id",jwtAuth(ROLE.everyone),checkSubscription, userController.deleteInstructor);

export default router;
