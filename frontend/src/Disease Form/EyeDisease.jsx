import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const EyeDisease = () => {
  const { backendUrl, token, userData, doctors } = useContext(AppContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const [Doc, setDoc] = useState([]);
  const [isLocation, SetIsLocation] = useState(null);

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
        `${backendUrl}/api/user/predict-eyedisease`,
        formData,
        {
          headers: { token },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setPredictionResult(data.success);

        const EyeDoctors = doctors.filter(
          (doc) => doc.speciality === "Eye Specialist"
        );

        const locationMatched = EyeDoctors.filter((doc) => {
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
          setDoc(EyeDoctors);
          SetIsLocation(false);
        }
      } else {
        toast.error(data.message);
        setPredictionResult(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Prediction failed. Please try again.");
      setPredictionResult(null);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-4 bg-blue-50 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Eye Disease Prediction Form
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
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2 bg-gray-50 mb-4"
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2 bg-gray-50 mb-4"
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2 bg-gray-50 mb-4"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Eye Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 mb-5"
          />
        </div>

        <button
          onClick={predict}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-md shadow-md mb-4"
        >
          Predict Eye Disease
        </button>
      </div>

      <div className="flex flex-col items-center w-full mt-8 px-4">
        <h2 className="text-gray-800 font-semibold mb-2 text-center">Result</h2>

        {predictionResult !== null && (
          <div
            className={`p-4 rounded-md w-full ${
              predictionResult ? "bg-red-50" : "bg-green-50"
            }`}
          >
            {predictionResult ? (
              <>
                <p className="text-red-700 font-semibold mb-2">
                  Eye condition detected. Please consult a specialist for
                  further evaluation.
                </p>
                <h3 className="text-red-700 font-semibold mb-2">
                  {isLocation
                    ? `Recommended Eye Specialists in ${location}`
                    : "No doctor found in your area. Showing all eye specialists."}
                </h3>

                <div className="grid grid-cols-auto gap-4 gap-y-6">
                  {Doc.map((item, index) => (
                    <div
                      onClick={() => navigate(`/appointments/${item._id}`)}
                      className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
                      key={index}
                    >
                      <img
                        className="bg-blue-50 w-full h-40 object-cover"
                        src={item.image}
                      />
                      <div className="p-4">
                        <div
                          className={`flex items-center gap-2 text-sm ${
                            item.available ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          <p
                            className={`w-2 h-2 ${
                              item.available ? "bg-green-500" : "bg-red-500"
                            } rounded-full`}
                          ></p>
                          <p>
                            {item.available ? "Available" : "Not Available"}
                          </p>
                        </div>
                        <p className="text-gray-900 text-lg font-medium">
                          {item.name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {item.speciality}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-green-700 font-semibold">
                No eye disease detected. Keep up the healthy lifestyle!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EyeDisease;
