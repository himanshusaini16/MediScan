import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"


const changeAvaialibility = async (req,res) =>{
    try {
        
        const {docId} = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available : !docData.available})
        res.json({success:true,message:"Avalibility change"})

    } catch (error) {
      //  console.log(error)
       res.json({success:false,message:error.message}) 
    }
}

const doctorList = async (req,res) =>{
    try {

        const doctors = await doctorModel.find({}).select(['-password','-email'])
        res.json({success:true,doctors})
        
    } catch (error) {
        // console.log(error)
        res.json({success:false,message:error.message}) 
    }
}

// api for doctor login

const loginDoctor = async (req,res) =>{
    try {

        const {email,password} = req.body
        const doctor = await doctorModel.findOne({email})

        if(!doctor){
            return res.json({success:false , message:"Invalid Credintilals"})
        }

        const isMatch = await bcrypt.compare(password,doctor.password)

        if(isMatch){
            const dtoken = jwt.sign({id:doctor._id,},process.env.JWT_SECRET)
            res.json({success:true,dtoken})
        }
        else{
            return res.json({success:false , message:"Invalid Credintilals"})
        }
        
    } catch (error) {
        // console.log(error)
        res.json({success:false,message:error.message}) 
    }
}

//api for register

// API for adding Doctor
const register = async (req, res) => {
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    res.json({ success: true, message: "Registeration Successfull now you can login" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api for get all appointment 

const appiontementsDoctor = async(req,res) =>{
    try {

        const {docId} = req.body
        console.log("DoctorId",docId)
        const appiontments = await appointmentModel.find({docId})

        // console.log("from server :",appiontments)

        res.json({success:true,appiontments})

        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message}) 
    }
}

// api for mark the appointment

const appointmentComplete = async (req, res) => {
    try {
      const { docId, appointmentId } = req.body;

      // console.log(docId)
      // console.log(appointmentId)
  
      const appiontmentData = await appointmentModel.findById(appointmentId);
  
      if (appiontmentData && appiontmentData.docId === docId) {

        await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted: true });
        return res.json({ success: true, message: "Appointment Completed" });

      } else {
        return res.json({ success: false, message: "Mark Failed" });
      }
  
    } catch (error) {
      // console.log(error);
      res.json({ success: false, message: error.message });
    }
  };
  
  // api for to cancellation tha appointment

  const appointmentCancel = async (req, res) => {
    try {
      const { docId, appointmentId } = req.body;
  
      const appiontmentData = await appointmentModel.findById(appointmentId);
  
      if (appiontmentData && appiontmentData.docId === docId) {
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
        return res.json({ success: true, message: "Appointment Cancelled" });
      } else {
        return res.json({ success: false, message: "Cancellation Failed" });
      }
  
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };

  // api to get dashboard for doctor

  const doctorDashboard = async (req,res) =>{
    try {
      
      const {docId} = req.body

      const appointments = await appointmentModel.find({docId})
      let earnings = 0

      appointments.map((item) =>{
        if(item.isCompleted || item.payment){
          earnings += item.amount
        }
      })

      let patients =[]
      appointments.map((item) =>{
        if(!patients.includes(item.userId)){
          patients.push(item.userId)
        }
      })

      const dashData = {
        earnings,
        appointments :appointments.length,
        patients : patients.length,
        latestAppointments : appointments.reverse().slice(0,5)
      }

      res.json({success:true , dashData})

    } catch (error) {
      // console.log(error);
      res.json({ success: false, message: error.message });
    }
  }

// api for get doctor profile

const doctorProfile = async(req,res) =>{
  try {

    const {docId} = req.body

    const profileData = await doctorModel.findById(docId).select('-password')

    res.json({success:true,profileData})

    
  } catch (error) {
    // console.log(error);
      res.json({ success: false, message: error.message });
  }
}

// api for update doctor Profile

const updateDoctorProfile = async(req,res) =>{
  try {

    const {docId,fees,address,available} = req.body

    await doctorModel.findByIdAndUpdate(docId,{fees,address,available})

    res.json({success:true,message:"Profile Updated"})

    
  } catch (error) {
    // console.log(error);
      res.json({ success: false, message: error.message });
  }
}


// api  to get otp
const ForgotPassword = async (req,res) =>{
  const {email} = req.body

  const doctor = await doctorModel.findOne({email})


  if(!doctor){
      return res.json({success:false,message:"User not found  Enter the valid user id"})
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  
  

  doctor.otp = otp
  doctor.otpExpiry = Date.now() + 3 * 60 * 1000 

  await doctor.save()

  res.json({success:true,message:"Otp send",otp})

}

// api for reset password

const resetPassword = async(req,res) =>{
  
  const {email,otp,password} = req.body

  const doctor = await doctorModel.findOne({email,otp,otpExpiry:{$gt : Date.now()}})


  if(!doctor){
      return res.json({success:false,message:"Invalid otp or otp is expired"})
  }

  doctor.password = await bcrypt.hash(password,10)

  doctor.otp = undefined
  doctor.otpExpiry = undefined
  await doctor.save()

  res.json({success:true,message:"password changed successfully"})
}


export {changeAvaialibility,doctorList,loginDoctor,appiontementsDoctor,appointmentComplete,appointmentCancel,doctorDashboard,doctorProfile,updateDoctorProfile,ForgotPassword,resetPassword,register}