import React from 'react';
import { Link } from 'react-router-dom';
import { specialityData } from '../assets/assets';

const diseases = [
  {
    name: 'Vericose Disease',
    description: 'Assess your veins health with our predictive model.',
    url: '/vericose-prediction',
    image: '/vericose.png'
  },
  {
    name: 'Diabetes Disease',
    description: 'Evaluate your risk of diabetes with a quick test.',
    url: '/diabetes-prediction',
    image: '/diabetes.png'
  },
 

  {
    name: 'Heart Disease',
    description: 'Determine your heart health status promptly.',
    url: '/heartdisease-prediction',
    image: '/heart.png',
  },
];

const SpecialtyMenu = () => {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-gray-800" id="speciality">
      <h1 className="text-3xl font-medium">Disease Predictions</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Predict Disease and through our extensive list of doctors, schedule your appointment hassle-free.
      </p>
      <div className="flex sm:justify-center gap-4 pt-5 w-full overflow-x-auto">
        {diseases.map((disease, idx) => (
          <Link
            key={idx}
            onClick={() => scrollTo(0, 0)}
            className="flex flex-col items-center bg-red-50 border border-spacing-y-2 border-blue-800 rounded-full p-4 text-xs cursor-pointer flex-shrink-0 hover:-translate-y-2 transition-all duration-500"
            to={disease.url}
          >
            <img
              className="w-16 h-16 sm:w-24 sm:h-24 mb-2 rounded-full object-cover"
              src={disease.image}
              alt={disease.name}
            />
            <p className="text-center">{disease.name}</p>
          </Link>
        ))}
      </div>
      <hr/>
      <h3 className="text-3xl font-medium">For General Disease Book Appiontment</h3>
      <div className='flex sm:justify-center gap-4 pt-5 w-full overflow-scroll'>
        
          <Link
            onClick={() => scrollTo(0, 0)}
           className="flex flex-col items-center bg-red-50 border border-spacing-y-2 border-blue-800 rounded-full p-4 text-xs cursor-pointer flex-shrink-0 hover:-translate-y-2 transition-all duration-500"
            to={`/doctors/General Physician}`}
          >
            <img className="w-20 h-30 sm:w-24 sm:h-24 mb-2 rounded-full object-cover" src='genralPhysician.png' alt='General%20Physician' />
            <p>General Physician</p>
          </Link>
      
      </div>
    </div>
  );
};

export default SpecialtyMenu;
