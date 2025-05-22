import express from "express";
import {
  addDoctor,
  addMedicine,
  adminDashbord,
  allDoctors,
  allMedicine,
  appointmentsAdmin,
  cancelAppointments,
  deleteDoctor,
  deleteMedicine,
  editMedicine,
  loginAdmin,
} from "../controllers/adminController.js";

import upload from "../middleware/multer.js";
import authAdmin from "../middleware/authAdmin.js";
import { changeAvaialibility } from "../controllers/doctorController.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availibility", authAdmin, changeAvaialibility);

adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, cancelAppointments);
adminRouter.get("/dashboard", authAdmin, adminDashbord);
adminRouter.post("/delete", authAdmin, deleteDoctor);
adminRouter.post(
  "/add-medicine",
  authAdmin,
  upload.single("image"),
  addMedicine
);
adminRouter.post("/all-medicine", authAdmin, allMedicine);
adminRouter.post("/delete-medicine", authAdmin, deleteMedicine);
adminRouter.post("/editMedicine", authAdmin, editMedicine);

export default adminRouter;
