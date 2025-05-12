import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AdminContext } from './context/AdminContext'
import { DoctorContext } from './context/DoctorContext'

import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

import Login from './pages/Login'
import ForgotPassword from './pages/Doctor/ForgotPassword'

// Admin Pages
import AllApointements from './pages/Admin/AllApointements'
import Dashbord from './pages/Admin/Dashbord'
import AddDoctor from './pages/Admin/AddDoctor'
import Doctorlist from './pages/Admin/Doctorlist'

// Doctor Pages
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorAppointment from './pages/Doctor/DoctorAppointment'
import DoctorProfile from './pages/Doctor/DoctorProfile'
import DoctorChatPage from './pages/Doctor/DoctorChat'

const App = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  const isAuthenticated = aToken || dToken

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        {isAuthenticated && (
          <Route
            path="*"
            element={
              <div className="bg-[#F8F9FD]">
                <Navbar />
                <div className="flex items-start">
                  <Sidebar />
                  <Routes>
                    {/* Admin Routes */}
                    <Route path="/" element={<></>} />
                    <Route path="/admin-dashboard" element={<Dashbord />} />
                    <Route path="/all-appiontements" element={<AllApointements />} />
                    <Route path="/add-doctor" element={<AddDoctor />} />
                    <Route path="/doctor-list" element={<Doctorlist />} />

                    {/* Doctor Routes */}
                    <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                    <Route path="/doctor-appointment" element={<DoctorAppointment />} />
                    <Route path="/doctor-profile" element={<DoctorProfile />} />
                    <Route path="/chat" element={<DoctorChatPage />} />
                  </Routes>
                </div>
              </div>
            }
          />
        )}

        {/* Redirect all other routes to login if not authenticated */}
        {!isAuthenticated && <Route path="*" element={<Login />} />}
      </Routes>
    </>
  )
}

export default App
