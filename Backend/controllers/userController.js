import userModel from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'
import tf from '@tensorflow/tfjs'
import { vericoseModel } from '../server.js'
import {Image} from 'image-js'
import fs, { truncate } from 'fs'
import vericoseModell from '../models/vericoseModell.js'
import diabetesModel from '../models/diabetesModel.js'
import heartDiseaseModel from '../models/heartDiseaseModel.js'
import eyediseaseModel from '../models/eyediseaseModel.js'
import skinCancerModel from '../models/skincancer.js'
import Review from '../models/review.js'



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

        const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET);

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
            return res.json({ success: false, message: "Email and password are required" });
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

const getProfile = async( req,res) =>{

    try {
        const {userId} = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({success:true,userData})
    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: error.message });
    }

}

// update user profile

const updateProfile = async (req,res) =>{
    try {
       const {userId,name,phone,address,dob,gender} = req.body
       const imageFile = req.file

       if(!name || !phone  || !dob || !gender){
        return res.json({success:false,message:"Data Is Missing"})
       }

       await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})

       if(imageFile){
        // upload image to clodianry
        const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
        const imageUrl = imageUpload.secure_url
        
        await userModel.findByIdAndUpdate(userId,{image:imageUrl})
       }

        res.json({success:true,message:"Profile Updated"})
    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: error.message });
    }

}

// Appointment book API

const bookAppointment = async (req,res) => {
    try {

        const {userId,docId,slotDate,slotTime} = req.body

        const docData = await doctorModel.findById(docId).select('-password')
        
        if(!docData.available){
          return  res.json({success:false,message :"Doctor is Not Available"})
        }

        let slots_booked = docData.slots_booked

        // checking for slots availibility
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({success:false,message :"Slot is Not Available"})
            }
            else{
                slots_booked[slotDate].push(slotTime)
            }
        }else{
            slots_booked[slotDate] = []
            slots_booked[slotDate].push[slotTime]
        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const  appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount : docData.fees,
            slotTime,
            slotDate,
            date : Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)

        await newAppointment.save()

        // saved new slots data in docData

        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true,message:"Appointment Booked"})
        
    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Api for My Appointmenst

const listAppointments = async (req,res) =>{
    try {
        const {userId} = req.body
        const appointments = await appointmentModel.find({userId})

        res.json({success:true,appointments})

    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// api for cancel the appointments

const cancelAppointments = async (req,res) =>{
    try {
        const {userId,appointmentId} = req.body
        const appointmentData =await appointmentModel.findById(appointmentId)
        
        // verify the appointment user

        if(appointmentData.userId !== userId){
            return res.json({success:false,message:"Unauthorization Action"})
        }
        
        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
        
        // release Doctor Slot

        const {docId,slotDate,slotTime} = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success : true,message:"Appointment Cancelled"})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

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

const verifyRazorpay = async(req,res) =>{
    try {
        const {razorpay_order_id} = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        // console.log(orderInfo)

        if(orderInfo.status === 'paid'){
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
            res.json({success:true,message:"Payment Successful"})
        }
        else{
            res.json({success:false,message:"Payment Failed"})
        }

    } catch (error) {
    // console.log(error);
    res.json({ success: false, message: error.message });
    }
}

// api for OTP 

const ForgotPassword = async (req,res) =>{
    const {email} = req.body

    const user = await userModel.findOne({email})

    if(!user){
        return res.json({success:false,message:"User not found  Enter the valid user id"})
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    

    user.otp = otp
    user.otpExpiry = Date.now() + 3 * 60 * 1000 

    await user.save()

    res.json({success:true,message:"Otp send",otp})

}

// api for reset password

const resetPassword = async(req,res) =>{
    
    const {email,otp,password} = req.body

    const user = await userModel.findOne({email,otp,otpExpiry:{$gt : Date.now()}})

    if(!user){
        return res.json({success:false,message:"Invalid otp or otp is expired"})
    }

    user.password = await bcrypt.hash(password,10)

    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    res.json({success:true,message:"password changed successfully"})
}

// api for predicting the vericose disease

const waitForVModel = async () => {
    while (!vericoseModel) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
};

async function processImage(imagePath) {
    const image = await Image.load(imagePath);

    let tensor = tf.browser.fromPixels(image)
        .resizeBilinear([64, 64]) 
        .toFloat()
        .div(tf.scalar(255))
        .expandDims();

    return tensor;
}


const vericosePredict = async (req,res) =>{

    await waitForVModel()

    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    try{
    const {userId,age,gender} = req.body
    const imageFile = req.file
    
    const userData = await userModel.findById(userId).select('-password')

  

    const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
    const imageUrl = imageUpload.secure_url
 



    const vericoseData = {
        userId,
        userData,
        age,
        image : imageUrl,
        gender,
        phone : userData.phone,
        date : Date.now()
    }

    const newVericoseData = new vericoseModell(vericoseData)

    await newVericoseData.save()


        const imagePath = req.file.path;
        const tensor = await processImage(imagePath);
        const prediction = vericoseModel.predict(tensor);
        const score = (await prediction.data())[0];

        fs.unlinkSync(imagePath);
        tensor.dispose();
        prediction.dispose();

        const isVaricoseDetected = score > 0.5

        if(isVaricoseDetected){
            await vericoseModell.findByIdAndUpdate(newVericoseData._id,{isPositive:true})
        }

        res.json({ 
            success :isVaricoseDetected,
            prediction: score.toFixed(5),
            message: isVaricoseDetected ? "Varicose Vein Detected" : "No VeriCose Disease",
            confidence: `${(score * 100).toFixed(2)}%`
        });

    
        
    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: error.message });
    }
}


const listPredictionHistory= async (req,res) =>{
    try {
        const {userId} = req.body
        const prediction = await vericoseModell.find({userId})
        // console.log(prediction)
        res.json({success:true,prediction})

    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const listPredictionHistoryDiabetes= async (req,res) =>{
    try {
        const {userId} = req.body
        const prediction = await diabetesModel.find({userId})
        // console.log(prediction)
        res.json({success:true,prediction})

    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: error.message });
    }
}


const listPredictionHistoryHeartDisease= async (req,res) =>{
    try {
        const {userId} = req.body
        const prediction = await heartDiseaseModel.find({userId})
        // console.log(prediction)
        res.json({success:true,prediction})

    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: error.message });
    }
}


const listPredictionHistoryEyeDisease= async (req,res) =>{
    try {
        const {userId} = req.body
        const prediction = await eyediseaseModel.find({userId})
        // console.log(prediction)
        res.json({success:true,prediction})

    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: error.message });
    }
}


const listPredictionHistorySkincancer= async (req,res) =>{
    try {
        const {userId} = req.body
        const prediction = await skinCancerModel.find({userId})
        // console.log(prediction)
        res.json({success:true,prediction})

    } catch (error) {
        // console.log(error);
        res.json({ success: false, message: error.message });
    }
}


// api for review

const addReview = async(req,res) =>{
    try{
        const {userId,rating,feedback} = req.body

        const user = await userModel.find("review user",userId)

        console.log(user)

        const reviewData={
            username:user.name,
            rating,
            feedback,
            date:Date.now()
        }

        console.log(reviewData)

        const newReviewData = new Review(reviewData)

        await newReviewData.save()

        res.json({success:true,message:"Review Added"})

    }
    catch(err){
        res.json({ success: false, message: err.message });
    }
}






export { registerUser, loginUser,getProfile,updateProfile,bookAppointment,listAppointments,cancelAppointments,paymentRazorpay,verifyRazorpay,vericosePredict,ForgotPassword
    ,resetPassword , listPredictionHistory,listPredictionHistoryDiabetes,listPredictionHistoryHeartDisease,listPredictionHistoryEyeDisease,listPredictionHistorySkincancer,addReview
 };
