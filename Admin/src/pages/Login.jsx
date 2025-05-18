/* eslint-disable no-unused-vars */
import React, { useContext, useState } from 'react'
import {assets} from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { data } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from "react-router-dom";

const Login = () => {

    const [state ,setState] = useState('Admin')
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const {setAToken,backendUrl} = useContext(AdminContext)
    const {setDToken} = useContext(DoctorContext)
    const navigate = useNavigate()

    const onSubmitHandle = async (event) =>{
        event.preventDefault()

        try {
            if(state === 'Admin'){
                const {data}  = await axios.post(backendUrl + '/api/admin/login',{email,password})
                if(data.success){
                    localStorage.setItem('aToken',data.token)
                    setAToken(data.token)
                }
                else{
                    toast.error(data.message)
                }
            
            }else{
                const {data} = await axios.post(backendUrl +'/api/doctors/login',{email,password})
                if(data.success){
                    localStorage.setItem('dToken',data.dtoken)
                    setDToken(data.dtoken)
                    console.log(data)
                }
                else{
                    toast.error(data.message)
                }
            }   
        
        } catch (error) {
            toast.error(error.message)
        }
    }


  return (
    <form onSubmit={onSubmitHandle} className='min-h-[80vh] flex items-center'>
        <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
            <p className='text-2xl font-semibold m-auto'>
                <span className='text-primary'>{state}</span> Login
            </p>
            <div className='w-full'>
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required></input>
            </div>
            <div className='w-full'>
                <p>Password</p>
                <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type='password' required></input>
            </div>
            <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>
            {
                state === 'Admin' 
                ?<p>Doctor Login? <span  className='text-primary underline cursor-pointer' onClick={()=>setState('Doctor')}>Click Here</span><br/><p>User Login? <a href="https://medi-scan-mrwk.vercel.app/login" className="text-primary underline cursor-pointer">Click for User Login</a></p></p>
                :<p><p className="text-primary underline cursor-pointer" onClick={() => navigate('/register')}>Click Here For Doctor Registration</p>
<span onClick={() => navigate('/forgot-password')} className="text-primary underline cursor-pointer">Forgot Password</span><br/>Admin Login? <span className='text-primary underline cursor-pointer' onClick={()=>setState('Admin')}>Click Here</span><p>User Login?   <a href="https://medi-scan-mrwk.vercel.app/login" className="text-primary underline cursor-pointer">Click Here</a></p></p>
            }
        </div>
    </form>
  )
}

export default Login
