import validator from "validator";
import bycrypt, { compareSync } from "bcrypt";
import { v2 as clodinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import Medicine from "../models/medicineModel.js";

// API for adding Doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "Missing Detail" });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please Enter a Valid Email",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a Striong password",
      });
    }

    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);

    const imageUpload = await clodinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;
    console.log(imageUrl);

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Api for admin Login

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Inavalid Crediantials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Apin to get all doctor list

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// api to get all appointment list

const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//api for cancel the appointement

const cancelAppointments = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// api for get Dashbord data

const adminDashbord = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      patients: users.length,
      appointments: appointments.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// api to delete the doctor

const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;
    // console.log(doctorId);

    if (!doctorId) {
      return res.json({ success: false, message: "Doctor ID is required" });
    }

    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    await doctorModel.findByIdAndDelete(doctorId);
    res.json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// api to add medicine

const addMedicine = async (req, res) => {
  try {
    const {
      name,
      manufacturer,
      description,
      price,
      stock,
      quantity,
      category,
      expiryDate,
      diseaseName,
    } = req.body;
    const imageFile = req.file;

    // console.log(req.body)
    // console.log(req.file)

    if (
      !name ||
      !manufacturer ||
      !description ||
      !price ||
      !stock ||
      !quantity ||
      !category ||
      !expiryDate ||
      !diseaseName
    ) {
      return res.json({ success: false, message: "Missing Deatil" });
    }

    const imageUpload = await clodinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;
    // console.log(imageUrl);

    const medicineData = {
      name,
      manufacturer,
      image: imageUrl,
      description,
      price,
      stock,
      quantity,
      category,
      expiryDate,
      diseaseName,
      date: Date.now(),
    };

    const newMedicineData = new Medicine(medicineData);
    await newMedicineData.save();

    res.json({ success: true, message: "Medicine Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to get all Medicine

const allMedicine = async (req, res) => {
  try {
    const medicines = await Medicine.find({});
    console.log(medicines);
    res.json({ success: true, medicines });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// api to delete medcine

const deleteMedicine = async (req, res) => {
  try {
    const { medicineId } = req.body;
    // console.log(medicineId);

    if (!medicineId) {
      return res.json({ success: false, message: "medicine ID is required" });
    }

    const medcine = await Medicine.findById(medicineId);

    if (!medcine) {
      return res.json({ success: false, message: "medicine not found" });
    }

    await Medicine.findByIdAndDelete(medicineId);
    res.json({ success: true, message: "medicine deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const editMedicine = async (req, res) => {
  try {
    const { medicineId, stock, expiryDate } = req.body;

    // console.log(medicineId)
    // console.log(stock)
    // console.log(expiryDate)

    if (!medicineId) {
      return res.status(400).json({ message: "medicineId is required" });
    }

    const updateFields = {};
    if (stock !== undefined) updateFields.stock = stock;
    if (expiryDate !== undefined) updateFields.expiryDate = expiryDate;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      medicineId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedMedicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    return res.json({
      message: "Medicine updated successfully",
      medicine: updatedMedicine,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  cancelAppointments,
  adminDashbord,
  deleteDoctor,
  addMedicine,
  allMedicine,
  deleteMedicine,
  editMedicine,
};
