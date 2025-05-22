import express from "express";
import {
  addReview,
  addToCart,
  allOrder,
  allReview,
  bookAppointment,
  cancelAppointments,
  confirmRazorpayPayment,
  createRazorpayOrder,
  ForgotPassword,
  getLatestOrder,
  getProfile,
  listAppointments,
  listPredictionHistory,
  listPredictionHistoryDiabetes,
  listPredictionHistoryEyeDisease,
  listPredictionHistoryHeartDisease,
  listPredictionHistorySkincancer,
  loginUser,
  medicineList,
  paymentRazorpay,
  registerUser,
  removeFromCart,
  resetPassword,
  updateProfile,
  vericosePredict,
  verifyRazorpay,
} from "../controllers/userController.js";
import authUser from "../middleware/authUser.js";
import upload from "../middleware/multer.js";
import {
  diabetesPredict,
  eyediseasePredict,
  heartdiseasePredict,
  skincancerPredict,
} from "../controllers/diseaseController.js";
// import { diabetesPredict } from '../controllers/diseaseController.js'

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile
);

userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointments);
userRouter.post("/cancel-appointment", authUser, cancelAppointments);
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay);
userRouter.post(
  "/predict-vericose",
  upload.single("image"),
  authUser,
  vericosePredict
);
userRouter.post("/reset", resetPassword);
userRouter.post("/forgot", ForgotPassword);
userRouter.get(
  "/prediction-history/diabetes",
  authUser,
  listPredictionHistoryDiabetes
);
userRouter.get("/prediction-history/varicose", authUser, listPredictionHistory);
userRouter.get(
  "/prediction-history/heartdisease",
  authUser,
  listPredictionHistoryHeartDisease
);

userRouter.post("/predict-diabetes", authUser, diabetesPredict);
userRouter.post("/predict-heartDisease", authUser, heartdiseasePredict);
userRouter.post(
  "/predict-eyedisease",
  authUser,
  upload.single("image"),
  eyediseasePredict
);
userRouter.get(
  "/prediction-history/eyedisease",
  authUser,
  listPredictionHistoryEyeDisease
);
userRouter.post(
  "/predict-skincancer",
  authUser,
  upload.single("image"),
  skincancerPredict
);
userRouter.get(
  "/prediction-history/skincancer",
  authUser,
  listPredictionHistorySkincancer
);
userRouter.post("/review", authUser, addReview);
userRouter.get("/all-review/:docId", allReview);
userRouter.get("/medicine", medicineList);

userRouter.post("/stock-add", authUser, removeFromCart);
userRouter.post("/createorder", authUser, createRazorpayOrder);
userRouter.post("/confirmorder", authUser, confirmRazorpayPayment);
userRouter.get("/getlatestorder/:userId", authUser, getLatestOrder);
userRouter.post("/add-to-cart", authUser, addToCart);
userRouter.get("/all-order", authUser, allOrder);

export default userRouter;
