import React, { useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';


const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const requestOtp = async () => {
    try {
      const { data } = await axios.post(backendUrl+'/api/doctors/forgot', { email });
      if (data.success) {
        setOtp(data.otp);
        toast.success(`${data.message}. Your OTP is: ${data.otp}`);
        setStep(2);
      } else {
        toast.error(data.message);
        setStep(1);
        navigate('/forgot-password')
      }
    } catch (error) {
      toast.error("not able to fetch");
      setStep(1);
    }
  };

  const resetPassword = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctors/reset`, {
        email,
        otp: enteredOtp,
        password: newPassword,
      });
      if (data.success) {
        toast.success('Password reset successful');
        navigate('/login');
        setStep(1);
        setEmail('');
        setEnteredOtp('');
        setNewPassword('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      
      toast.error(error.message);
    }
  };

  return (
    <div  className="min-h-[80vh] flex items-center">
    <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 tetx-sm shadow-lg">
      {step === 1 && (
        <div className='p-20'>
          <h2 className="text-2xl font-semibold mb-6 text-center">Forgot Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            className="border border-zinc-300 rounded w-full p-2 mt-5 mb-5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={requestOtp}
            className="bg-primary text-white w-full py-2 rounded-md text-base "
          >
            Send OTP
          </button>
        </div>
      )}
      {step === 2 && (
        <div className='p-10'>
          <h2 className="text-2xl font-semibold mb-6 text-center">Reset Password</h2>
          <p className="mb-4 text-sm text-gray-600 text-center">
            Your OTP is: <strong>{otp}</strong>
          </p>
          <input
            type="text"
            placeholder="Enter OTP"
           className="border border-zinc-300 rounded w-full p-2 mt-2 mb-2"
            value={enteredOtp}
            onChange={(e) => setEnteredOtp(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter new password"
            className="border border-zinc-300 rounded w-full p-2 mt-2 mb-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            onClick={resetPassword}
           className="bg-primary text-white w-full py-3 rounded-md text-base mt-1 "
          >
            Reset Password
          </button>
        </div>
      )}
    </div>
  </div>
);
};

export default ForgotPassword;
