// eslint-disable-next-line no-unused-vars
import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          ABOUT<span className="text-gray-700 font-medium">US</span>{" "}
        </p>
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-12">
        <img className="w-full md:max-w-[360px]" src={assets.about_image} />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600">
          <p>
        Welcome to MediScan – Your Trusted Partner in Predicting Diseases and Managing Healthcare Efficiently

At MediScan, we harness the power of AI to help you detect potential health conditions early and connect you with the right doctor effortlessly. Our intelligent system analyzes your symptoms and predicts the likelihood of disease, guiding you to book an appointment with a qualified specialist – all in one seamless platform.{" "}
          </p>
          <p>
            MediScan is dedicated to advancing healthcare through cutting-edge technology.
We continually enhance our platform by integrating the latest innovations to improve user experience and deliver exceptional service. Whether you're booking your first diagnostic appointment or managing ongoing health needs, MediScan is here to support you—every step of the way.{" "}
          </p>
          <b className="text-gray-800">OUR VISION</b>
          <p>
          At MediScan, our vision is to create a seamless and intelligent healthcare experience for every user.
We strive to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need—whenever and wherever you need it
          </p>
        </div>
      </div>

      <div className="text-xl my-4">
        <p>
          WHY <span className="text-gray-700 font-semibold">CHOOSE US</span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row mb-20">
        <div  className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-500 cursor-pointer ">
          <b >EFFICIENCY</b>
          <p>Steamlined appointment Scheduling that fits into your busy lifestyle.</p>
        </div>

        <div  className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-500 cursor-pointer ">
          <b>CONVENIENCE</b>
          <p>Access to a network of trusted Healthcare professionals in your area.</p>
        </div>

        <div  className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-500 cursor-pointer ">
          <b>PERSONALIZATION</b>
          <p>Tailored recommendations and reminders to help you stay on top of your Health.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
