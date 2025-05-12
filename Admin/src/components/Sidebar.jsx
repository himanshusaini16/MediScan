// eslint-disable-next-line no-unused-vars
import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'

const Sidebar = () => {

    const {aToken } = useContext(AdminContext)
    const {dToken} = useContext(DoctorContext)
  return (
    <div className='min-h-screen bg-white border-r'>
      {
        aToken && <ul className='text-[#515151] mt-5'>

        <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5  md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/admin-dashboard'}>
            <img src={assets.home_icon}></img>
            <p className='hidden md:block'>Dashbord</p>
        </NavLink>

        <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5  md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/all-appiontements'}> 
            <img src={assets.appointment_icon}></img>
            <p className='hidden md:block'>Appiontements</p>
        </NavLink>

        <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5  md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/add-doctor'}>
            <img src={assets.add_icon}></img>
            <p className='hidden md:block'>Add Doctor</p>
        </NavLink>

        <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5  md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-list'}>
            <img src={assets.people_icon}></img>
            <p className='hidden md:block'>Doctor List</p>
        </NavLink>

        </ul>
      }


      {
        dToken && <ul className='text-[#515151] mt-5'>

        <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5  md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-dashboard'}>
            <img src={assets.home_icon}></img>
            <p className='hidden md:block'>Dashbord</p>
        </NavLink>

        <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5  md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-appointment'}> 
            <img src={assets.appointment_icon}></img>
            <p className='hidden md:block'>Appiontements</p>
        </NavLink>

        <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5  md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-profile'}>
            <img src={assets.people_icon}></img>
            <p className='hidden md:block'>Doctor Profile</p>
        </NavLink>

        <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5  md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/chat'}>
        <img className="w-8 bg-blue-50" src='/messenger.png'></img>
            <p className='hidden md:block'>Message</p>
        </NavLink>

        </ul>
      }

    </div>
  )
}

export default Sidebar
