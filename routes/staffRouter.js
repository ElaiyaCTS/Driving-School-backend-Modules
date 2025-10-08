
import express from "express";
import exadminController from "../controllers/exadminController.js";
import {createStaff,getAllStaff,getStaffById,updateStaff,deleteStaff} from "../controllers/staff.js";
import jwtAuth from "../middlewares/jwtMiddleware.js";
import checkSubscription from "../middlewares/checkSubscription.js";
import multer from "multer";
import ROLE from "../util/roleGroups.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// console.log(upload.fields);


const fileFieldsInstead = [
  { name: "photo", maxCount: 1 }, // 🚨 "photo" instead of "profile"
];

router.post("/create",jwtAuth(ROLE.adminLevel),checkSubscription,upload.fields(fileFieldsInstead),createStaff);

// get all data
router.get("/", jwtAuth(ROLE.adminLevel),checkSubscription, getAllStaff);


// get single data
router.get("/:id",jwtAuth(ROLE.adminLevel),checkSubscription, getStaffById);
// router.get("/:id",jwtAuth(ROLE.adminLevel), getStaffById);

// UPDATE
router.put("/:id",jwtAuth(ROLE.adminLevel),checkSubscription,upload.fields(fileFieldsInstead),updateStaff);

// DELETE
router.delete("/:id",jwtAuth(ROLE.adminLevel),checkSubscription,deleteStaff);

export default router;
