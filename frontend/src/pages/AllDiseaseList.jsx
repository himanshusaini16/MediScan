import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    name: 'Skin Cancer Disease',
    description: 'Check for potential lung issues using our tool.',
    url: '/skincancer-prediction',
    image: '/cancer.png'
  },
  {
    name: 'Eye Disease',
    description: 'Identify common skin conditions through analysis.',
    url: '/eyedisease-prediction',
    image: '/eye.png'
  },
  {
    name: 'Heart Disease',
    description: 'Determine your kidney health status promptly.',
    url: '/heartdisease-prediction',
    image: '/heart.png',
  },
];

const AllDiseaseList = () => {
  const navigate = useNavigate();

  const handlePredict = (url) => {
    navigate(url);
  };



  return (
  <div className="p-8 bg-gradient-to-br from-blue-50 to-white min-h-screen">
    <h2 className="text-4xl font-bold text-center text-blue-800 mb-12">
      🩺 Choose a Disease to Predict
    </h2>
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 gap-y-10">
      {diseases.map((disease, index) => (
        <div
          key={index}
          className="border w-full h-full border-blue-200 bg-blue-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-500"
        >
          <img
            src={disease.image}
            alt={disease.name}
            className="bg-red-50 w-full"
          />

          <h3 className="text-xl font-semibold text-blue-900 m-2 text-center">
            {disease.name}
          </h3>
          <p className="text-gray-500 mb-6 text-sm text-center ">
            {disease.description}
          </p>
          <button
            onClick={() => handlePredict(disease.url)}
            className="bg-gradient-to-r w-full from-blue-500 to-indigo-500 text-white font-medium py-2 px-6 hover:opacity-90 transition-all duration-200"
          >
            🔍 Predict Now
          </button>
        </div>
      ))}
    </div>
  </div>
);

};

export default AllDiseaseList;
