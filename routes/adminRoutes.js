import express from 'express';
import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from '../controllers/adminController.js';
import multer from "multer";

const router = express.Router();
// Set up multer for file uploads
const storage = multer.memoryStorage();
// Set file size limit to 5MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ Set file size limit
});

const fileFieldsInstead = [
  { name: "photo", maxCount: 1 }, // 🚨 "photo" instead of "profile"
];

// Create a new admin
router.post('/create', upload.fields(fileFieldsInstead), createAdmin);

// Get all admins
router.get('/', getAllAdmins);

// Get a single admin by ID
router.get('/:adminId', getAdminById);

// Update admin by ID
router.put('/:adminId',  upload.fields(fileFieldsInstead),updateAdmin);

// Delete admin by ID
router.delete('/:adminId', deleteAdmin);

export default router;
