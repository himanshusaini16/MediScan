// eslint-disable-next-line no-unused-vars
import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        <div>
            <img className='mb-5 w-40'  src='/logo.png' alt=''/>
            <p className='w-full md:w-2/3 text-gray-600 leading-6'>Health is the greatest gift, and contentment is the greatest wealth, reminding us that true happiness comes from within and cannot be bought Buddha
            Take care of your body because it is the only place you have to live, and its well-being determines the quality of your life.Jim Rohn</p>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>Comapany</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>Home</li>
                <li>About Us</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>GET IN  TOUCH</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>+91 81127 09856</li>
                <li>MediScan@gmail.com</li>
            </ul>
        </div>

      </div>
      <div>
        <hr></hr>
        <p className='py-5 text-sm text-center'>Copyright 2025 @MediScan -All right Reserved.</p>
      </div>
    </div>
  )
}

export default Footer
