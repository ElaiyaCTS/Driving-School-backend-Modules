
import express from "express";
// import exadminController from "../controllers/exadminController.js";
import userController from "../controllers/InstructorController.js";
import jwtAuth from "../middlewares/jwtMiddleware.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage,
     limits: { fileSize: 5 * 1024 * 1024 }, // ✅ Set file size limit
 });


const fileFieldsInstead = [
  { name: "photo", maxCount: 1 }, // 🚨 "photo" instead of "profile"
];

router.post(
  "/create-Instructor",jwtAuth(["Admin"]),
  upload.fields(fileFieldsInstead), // Add this middleware
  userController.createInstructor
);
// get all data
router.get("/instructors", jwtAuth(["Admin","Instructor"]), userController.getAllInstructors);

// get single data
router.get("/instructor/:_id",jwtAuth(["Admin","Instructor"]), userController.getInstructorById);

// UPDATE
router.put("/instructor/:instructorId",jwtAuth(["Admin","Instructor"]),upload.fields(fileFieldsInstead),userController.updateInstructor);

// DELETE
router.delete("/instructor/:_id",jwtAuth(["Admin"]), userController.deleteInstructor);

export default router;
