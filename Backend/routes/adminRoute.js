import express from 'express'
import { addDoctor,adminDashbord,allDoctors,appointmentsAdmin,cancelAppointments,deleteDoctor,loginAdmin } from '../controllers/adminController.js'

import upload from '../middleware/multer.js'
import authAdmin from '../middleware/authAdmin.js'
import { changeAvaialibility } from '../controllers/doctorController.js'

const adminRouter = express.Router()

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-doctors',authAdmin,allDoctors)
adminRouter.post('/change-availibility',authAdmin,changeAvaialibility)

adminRouter.get('/appointments',authAdmin,appointmentsAdmin)
adminRouter.post('/cancel-appointment',authAdmin,cancelAppointments)
adminRouter.get('/dashboard',authAdmin,adminDashbord)
adminRouter.post('/delete',authAdmin,deleteDoctor)

export default adminRouter