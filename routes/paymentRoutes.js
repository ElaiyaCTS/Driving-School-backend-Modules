import express from "express";
import { createPayment, getPayments, getPaymentById, deletePayment } from "../controllers/paymentController.js";
import jwtAuth from "../middlewares/jwtMiddleware.js";
import ROLE from "../util/roleGroups.js";

const router = express.Router();

router.post("/", jwtAuth(ROLE.branchTeam),createPayment);
router.get("/",jwtAuth(ROLE.branchTeam), getPayments);
router.get("/createdBy/:createdBy",jwtAuth(ROLE.branchTeam), getPayments);
router.get("/:id",jwtAuth(ROLE.everyone), getPayments);
// router.get("/:id",jwtAuth(["Admin","Instructor","Learner"]), getPaymentById);
router.delete("/:id",jwtAuth(ROLE.superUsers), deletePayment);

export default router;
