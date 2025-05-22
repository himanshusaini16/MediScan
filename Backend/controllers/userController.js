import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";
import tf from "@tensorflow/tfjs";
import { vericoseModel } from "../server.js";
import { Image } from "image-js";
import fs, { truncate } from "fs";
import vericoseModell from "../models/vericoseModell.js";
import diabetesModel from "../models/diabetesModel.js";
import heartDiseaseModel from "../models/heartDiseaseModel.js";
import eyediseaseModel from "../models/eyediseaseModel.js";
import skinCancerModel from "../models/skincancer.js";
import Review from "../models/review.js";
import Medicine from "../models/medicineModel.js";
import Order from "../models/orderModel.js";
import mongoose from "mongoose";

// Api to register to User

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a Valid Email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a Strong Password" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user || !user.password) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// user profile data

const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update user profile

const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Is Missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // upload image to clodianry
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageUrl });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Appointment book API

const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor is Not Available" });
    }

    let slots_booked = docData.slots_booked;

    // checking for slots availibility
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot is Not Available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push[slotTime];
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);

    await newAppointment.save();

    // saved new slots data in docData

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Api for My Appointmenst

const listAppointments = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api for cancel the appointments

const cancelAppointments = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify the appointment user

    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorization Action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // release Doctor Slot

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for payment

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Appointment Cancelled or Not Found",
      });
    }

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY || "INR",
      receipt: appointmentId,
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order || !order.id) {
      return res.status(500).json({
        success: false,
        message: "Order creation failed with Razorpay",
      });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api for verify the payment

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    // console.log(orderInfo)

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api for OTP

const ForgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.json({
      success: false,
      message: "User not found  Enter the valid user id",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpiry = Date.now() + 3 * 60 * 1000;

  await user.save();

  res.json({ success: true, message: "Otp send", otp });
};

// api for reset password

const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  const user = await userModel.findOne({
    email,
    otp,
    otpExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.json({
      success: false,
      message: "Invalid otp or otp is expired",
    });
  }

  user.password = await bcrypt.hash(password, 10);

  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({ success: true, message: "password changed successfully" });
};

// api for predicting the vericose disease

const waitForVModel = async () => {
  while (!vericoseModel) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

async function processImage(imagePath) {
  const image = await Image.load(imagePath);

  let tensor = tf.browser
    .fromPixels(image)
    .resizeBilinear([64, 64])
    .toFloat()
    .div(tf.scalar(255))
    .expandDims();

  return tensor;
}

const vericosePredict = async (req, res) => {
  await waitForVModel();

  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  try {
    const { userId, age, gender } = req.body;
    const imageFile = req.file;

    const userData = await userModel.findById(userId).select("-password");

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    const vericoseData = {
      userId,
      userData,
      age,
      image: imageUrl,
      gender,
      phone: userData.phone,
      date: Date.now(),
    };

    const newVericoseData = new vericoseModell(vericoseData);

    await newVericoseData.save();

    const imagePath = req.file.path;
    const tensor = await processImage(imagePath);
    const prediction = vericoseModel.predict(tensor);
    const score = (await prediction.data())[0];

    fs.unlinkSync(imagePath);
    tensor.dispose();
    prediction.dispose();

    const isVaricoseDetected = score > 0.5;

    if (isVaricoseDetected) {
      await vericoseModell.findByIdAndUpdate(newVericoseData._id, {
        isPositive: true,
      });
    }

    res.json({
      success: isVaricoseDetected,
      prediction: score.toFixed(5),
      message: isVaricoseDetected
        ? "Varicose Vein Detected"
        : "No VeriCose Disease",
      confidence: `${(score * 100).toFixed(2)}%`,
    });
  } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const listPredictionHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    const prediction = await vericoseModell.find({ userId });
    // console.log(prediction)
    res.json({ success: true, prediction });
  } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const listPredictionHistoryDiabetes = async (req, res) => {
  try {
    const { userId } = req.body;
    const prediction = await diabetesModel.find({ userId });
    // console.log(prediction)
    res.json({ success: true, prediction });
  } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const listPredictionHistoryHeartDisease = async (req, res) => {
  try {
    const { userId } = req.body;
    const prediction = await heartDiseaseModel.find({ userId });
    // console.log(prediction)
    res.json({ success: true, prediction });
  } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const listPredictionHistoryEyeDisease = async (req, res) => {
  try {
    const { userId } = req.body;
    const prediction = await eyediseaseModel.find({ userId });
    // console.log(prediction)
    res.json({ success: true, prediction });
  } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const listPredictionHistorySkincancer = async (req, res) => {
  try {
    const { userId } = req.body;
    const prediction = await skinCancerModel.find({ userId });
    // console.log(prediction)
    res.json({ success: true, prediction });
  } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api for review

const addReview = async (req, res) => {
  try {
    const { userId, rating, feedback, docId } = req.body;

    const userData = await userModel.findById(userId);
    const doctorData = await doctorModel.findById(docId);

    // console.log(doctorData)

    if (!userData || !doctorData) {
      return res
        .status(404)
        .json({ success: false, message: "User or Doctor not found" });
    }

    const reviewData = {
      username: userData.name,
      rating,
      feedback,
      docId: doctorData._id,
      docData: doctorData,
      date: Date.now(),
    };

    // console.log(reviewData)

    const newReview = new Review(reviewData);
    await newReview.save();

    res.json({ success: true, message: "Review Added" });
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// api for get all review

const allReview = async (req, res) => {
  try {
    const { docId } = req.params;

    // console.log("docId",docId)

    const review = await Review.find({ docId });
    // console.log("all review",review)
    res.json({ success: true, review });
  } catch (error) {
    // console.log(error)
    res.json({ success: false, message: error.message });
  }
};

// api for get All medicine

const medicineList = async (req, res) => {
  try {
    const medicine = await Medicine.find({});
    res.json({ success: true, medicine });
    // console.log(medicine)
  } catch (error) {
    // console.log(error)
    res.json({ success: false, message: error.message });
  }
};

//api to add in cart

const addToCart = async (req, res) => {
  try {
    const { userId, medicineId, quantity } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (!medicineId || !quantity) {
      return res
        .status(400)
        .json({ message: "Medicine ID and quantity are required." });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res
        .status(404)
        .json({ message: `Medicine not found: ${medicineId}` });
    }

    if (medicine.stock < quantity) {
      return res
        .status(400)
        .json({ message: `Insufficient stock for ${medicine.name}` });
    }

    medicine.stock -= quantity;
    await medicine.save();

    let order = await Order.findOne({
      userId,
      isPaid: false,
      isDelivered: false,
    });

    if (!order) {
      order = new Order({
        userId,
        medicines: [],
        totalAmount: 0,
        isPaid: false,
        isDelivered: false,
      });
    }
    const existingMedicineIndex = order.medicines.findIndex(
      (item) => item.medicineId.toString() === medicineId
    );

    if (existingMedicineIndex > -1) {
      order.medicines[existingMedicineIndex].quantity += quantity;
    } else {
      order.medicines.push({
        medicineId: medicine._id,
        name: medicine.name,
        image: medicine.image,
        price: medicine.price,
        quantity,
      });
    }
    order.totalAmount = order.medicines.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await order.save();

    res.status(201).json({
      message: "Item added to cart successfully",
      order,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeFromCart = async (req, res) => {
  const { orderId, medicineId } = req.body;

  if (!orderId || !medicineId) {
    return res
      .status(400)
      .json({ message: "orderId and medicineId are required" });
  }

  // console.log(orderId,medicineId)

  try {
    const order = await Order.findById(orderId);
    // console.log(order)
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const medicineIndex = order.medicines.findIndex(
      (item) => item.medicineId.toString() === medicineId
    );

    if (medicineIndex === -1) {
      return res.status(404).json({ message: "Medicine not found in order" });
    }

    const medicineItem = order.medicines[medicineIndex];

    // console.log(medicineItem)

    order.medicines.splice(medicineIndex, 1);

    order.totalAmount -= medicineItem.price * medicineItem.quantity;

    await order.save();

    const medicine = await Medicine.findById(medicineId);
    console.log(medicine);
    if (!medicine) {
      return res
        .status(404)
        .json({ message: "Medicine not found in database" });
    }

    medicine.stock += medicineItem.quantity;

    // console.log(medicine.stock)

    const newData = await medicine.save();

    // console.log("newData",newData)

    res
      .status(200)
      .json({
        message: "Medicine removed from order and stock restored",
        order,
      });
  } catch (error) {
    console.error("Error removing medicine from order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const allOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    // No populate needed, since details are embedded in the order document
    const orders = await Order.find({ userId });

    const formatted = orders.map((order) => ({
      _id: order._id,
      date: order.date,
      isPaid: order.isPaid,
      isDelivered: order.isDelivered,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      medicines: order.medicines.map((item) => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        imageUrl: item.image,
      })),
    }));

    // console.log("formatted",formatted)

    res.status(200).json({ orders: formatted });
  } catch (err) {
    console.error("Failed to fetch orders", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!paymentMethod || !["cash", "online"].includes(paymentMethod)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing payment method" });
    }

    const order = await Order.findById(orderId);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.isPaid)
      return res
        .status(400)
        .json({ success: false, message: "Order already paid" });

    order.paymentMethod = paymentMethod;

    console.log(paymentMethod);

    if (paymentMethod === "online") {
      const options = {
        amount: Math.round(order.totalAmount * 100),
        currency: process.env.CURRENCY || "INR",
        receipt: orderId,
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);

      if (!razorpayOrder?.id) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to create Razorpay order" });
      }

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.json({ success: true, order: razorpayOrder });
    } else if (paymentMethod === "cash") {
      order.isPaid = true;
      await order.save();

      return res.json({
        success: true,
        order,
        message: "Order placed with Cash on Delivery",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm Payment
const confirmRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    const razorpayOrder = await razorpayInstance.orders.fetch(
      razorpay_order_id
    );
    if (!razorpayOrder?.receipt)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    const localOrder = await Order.findById(razorpayOrder.receipt);
    if (!localOrder)
      return res
        .status(404)
        .json({ success: false, message: "Local order not found" });

    if (razorpayOrder.status === "paid") {
      localOrder.isPaid = true;
      await localOrder.save();
      return res.json({ success: true, message: "Payment successful" });
    }

    res.status(400).json({ success: false, message: "Payment not completed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLatestOrder = async (req, res) => {
  try {
    const { userId } = req.params;
    const order = await Order.findOne({ userId }).sort({ createdAt: -1 });

    if (!order) {
      return res.json({ success: true, order: null });
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch latest order" });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointments,
  paymentRazorpay,
  verifyRazorpay,
  vericosePredict,
  ForgotPassword,
  resetPassword,
  listPredictionHistory,
  listPredictionHistoryDiabetes,
  listPredictionHistoryHeartDisease,
  listPredictionHistoryEyeDisease,
  listPredictionHistorySkincancer,
  addReview,
  allReview,
  medicineList,
  removeFromCart,
  confirmRazorpayPayment,
  createRazorpayOrder,
  getLatestOrder,
  addToCart,
  allOrder,
};
