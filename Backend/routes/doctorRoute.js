import express from 'express'
import { appiontementsDoctor, appointmentCancel, appointmentComplete, doctorDashboard, doctorList, doctorProfile, ForgotPassword, loginDoctor, resetPassword, updateDoctorProfile } from '../controllers/doctorController.js'
import authDoctor from '../middleware/authDoctor.js'

const doctorRouter = express.Router()

doctorRouter.get('/list',doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.get('/appointments',authDoctor,appiontementsDoctor)
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete);
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
doctorRouter.get('/dashboard',authDoctor,doctorDashboard)
doctorRouter.get('/profile',authDoctor,doctorProfile)
doctorRouter.post('/update-profile',authDoctor,updateDoctorProfile)
doctorRouter.post('/reset',resetPassword)
doctorRouter.post('/forgot',ForgotPassword)


export default doctorRouter;


