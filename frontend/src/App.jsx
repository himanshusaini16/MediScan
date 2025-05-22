// eslint-disable-next-line no-unused-vars
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctor from './pages/Doctor'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Profile from './pages/Profile'
import Appiontments from './pages/Appiontments'
import MyAppointements from './pages/MyAppointements'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import Prediction from './pages/Prediction'
import ForgotPassword from './pages/ForgotPassword'
import Chat from './pages/Chat'
import History from './pages/History'
import AllDiseaseList from './pages/AllDiseaseList'
import Diabetes from './Disease Form/Diabetes'
import HeartDisease from './Disease Form/HeartDisease'
import EyeDisease from './Disease Form/EyeDisease'
import SkinPrediction from './Disease Form/Skincancer'
import Message from './pages/Message'
import Medicine from './pages/Medicine'
import Cart from './pages/Cart'



const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
    <ToastContainer/>
    <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/doctors' element={<Doctor/>}/>
        <Route path='/doctors/:speciality' element={<Doctor/>}/>
        <Route path='/login' element={<Login/>} />
        <Route path='/about' element={<About/>} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/my-profile' element={<Profile/>} />
        <Route path='/my-appointments' element={<MyAppointements/>} />
        <Route path='/appointments/:docId' element={<Appiontments/>} />
        <Route path='/vericose-prediction' element={<Prediction/>} />
        <Route path='/forgot-password' element={<ForgotPassword/>} />
        <Route path='/chat:id' element={<Chat/>} />
        <Route path='/prediction-history' element={<History/>} />
        <Route path='/disease-list' element={<AllDiseaseList/>} />
        <Route path='/diabetes-prediction' element={<Diabetes/>} />
        <Route path='/heartdisease-prediction' element={<HeartDisease/>} />
        <Route path='/eyedisease-prediction' element={<EyeDisease/>} />
        <Route path='/skincancer-prediction' element={<SkinPrediction></SkinPrediction>}></Route>
        <Route path='/chat/:id' element={<Chat/>} />
        <Route path='/message' element={<Message/>}></Route>
        <Route path='/medicine-store' element={<Medicine/>} />
        <Route path='/medicine-store/:category' element={<Medicine/>} />
        <Route path='/cart' element={<Cart/>} />
      </Routes>
      <Footer/>
    </div>
  )
}

export default App
