import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const SkinPrediction = () => {
  const { backendUrl, token, userData, doctors } = useContext(AppContext);

  const [selectedFile, setSelectedFile] = useState(null);
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const [Doc, setDoc] = useState([]);
  const [isLocation, SetIsLocation] = useState(null);
  const [confidence, setConfidence] = useState("");
  const [skincancer, setSkincancer] = useState("");

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    e.preventDefault();
    setSelectedFile(e.target.files[0]);
  };

  const predict = async () => {
    try {
      if (!token) {
        toast.warn("Login to Predict the disease");
        return navigate("/login");
      }

      if (!selectedFile) {
        toast.warn("Please select an image to upload");
        return;
      }

      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("image", selectedFile);
      formData.append("userId", userData._id);
      formData.append("dob", dob);
      formData.append("age", age);
      formData.append("gender", gender);
      formData.append("location", location);

      const { data } = await axios.post(
        `${backendUrl}/api/user/predict-skincancer`, // Change endpoint for skin disease
        formData,
        {
          headers: { token },
        }
      );

      if (data.success) {
        toast.success(data.message);

        setPredictionResult(data.success);
        setConfidence(data.confidence);

        setSkincancer(data.predictedClass);

        const Doctor = doctors.filter(
          (doc) => doc.speciality === "Dermatologist"
        );

        const locationMatched = Doctor.filter((doc) => {
          try {
            const address = JSON.parse(doc.address);
            return (
              address.line1.toLowerCase().includes(location.toLowerCase()) ||
              address.line2.toLowerCase().includes(location.toLowerCase())
            );
          } catch (e) {
            return false;
          }
        });

        if (locationMatched.length > 0) {
          setDoc(locationMatched);
          SetIsLocation(true);
        } else {
          setDoc(Doctor);
          SetIsLocation(false);
        }
      } else {
        toast.error(data.message);
        setPredictionResult(data.success);
        setConfidence(data.confidence);
        setSkincancer("");
      }
    } catch (error) {
      console.error(error);
      toast.error("Prediction failed. Please try again.");
      setPredictionResult("");
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-4 bg-blue-50 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Skin Disease Prediction Form
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <p className="mb-4">{userData.name}</p>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="block w-full border border-gray-300 rounded-lg p-2 mb-4"
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="block w-full border border-gray-300 rounded-lg p-2 mb-4"
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="block w-full border border-gray-300 rounded-lg p-2 mb-4"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full border border-gray-300 rounded-lg p-2 mb-5"
          />
        </div>

        <button
          onClick={predict}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md mb-4"
        >
          Click for Prediction
        </button>
      </div>
      <div className="flex flex-col  w-full mt-8 px-4">
        <h2 className=" text-gray-800 font-semibold mb-2">Result Shown Here</h2>

        {predictionResult !== null && (
          <div
            className={`p-4 rounded-md w-full ${
              predictionResult ? "bg-red-50" : "bg-green-50"
            }`}
          >
            {predictionResult ? (
              <>
                <p className="text-red-500 font-semibold mb-2">
                  Model predicts that you may have <br></br>
                  <b className="text-red-800">{skincancer}</b> cancer with a
                  confidence level of{" "}
                  <b className="text-green-800">{confidence}%</b>. It is
                  advisable to consult a dermatologist for a comprehensive
                  diagnosis and appropriate treatment.
                </p>
                <h3 className="text-red-500 font-semibold mb-2">
                  {isLocation
                    ? `Recommended Specialists near ${location}`
                    : "No specialist found in your location. Showing all Skin Disease specialists:"}
                </h3>

                <div className="grid grid-cols-auto gap-4">
                  {Doc.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => navigate(`/appointments/${item._id}`)}
                      className="border border-blue-200 rounded-xl cursor-pointer hover:-translate-y-2 transition-all"
                    >
                      <img
                        className="w-full h-48 object-cover bg-blue-50"
                        src={item.image}
                        alt="Doctor"
                      />
                      <div className="p-4">
                        <div
                          className={`flex items-center text-sm gap-2 ${
                            item.available ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.available ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <p>
                            {item.available ? "Available" : "Not Available"}
                          </p>
                        </div>
                        <p className="text-lg font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.speciality}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-green-500 font-semibold">
                Model predicts that you do not have any form of skin cancer,
                with a confidence level of{" "}
                <b className="text-green-800">{confidence}%</b>. No signs of
                skin disease were detected! 🎉 Keep maintaining your skin health
                and hygiene. However, it's always a good practice to stay alert
                and consult a dermatologist if you notice any unusual changes in
                your skin.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkinPrediction;
