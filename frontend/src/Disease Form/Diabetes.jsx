import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Diabetes = () => {
  const { backendUrl, token, userData } = useContext(AppContext);
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const { doctors } = useContext(AppContext);
  const [Doc, setDoc] = useState([]);
  const [isLocation, SetIsLocation] = useState(null);
  const [pregnancies, setPregnancies] = useState("");
  const [glucose, setGlucose] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [skinThickness, setSkinThickness] = useState("");
  const [insulin, setInsulin] = useState("");
  const [bmi, setBmi] = useState("");
  const [diabetesPedigreeFunction, setDiabetesPedigreeFunction] = useState("");

  const navigate = useNavigate();

  const predict = async () => {
    try {
      if (!token) {
        toast.warn("Login to Predict the disease");
        return navigate("/login");
      }

      const predictionData = {
        userId: userData._id,
        Pregnancies: parseInt(pregnancies),
        Glucose: parseInt(glucose),
        BloodPressure: parseInt(bloodPressure),
        SkinThickness: parseInt(skinThickness),
        Insulin: parseInt(insulin),
        BMI: parseFloat(bmi),
        DiabetesPedigreeFunction: parseFloat(diabetesPedigreeFunction),
        Age: parseInt(age),
        gender: gender.toLowerCase(),
        location: location,
      };

      const { data } = await axios.post(
        `${backendUrl}/api/user/predict-diabetes`,
        predictionData,
        {
          headers: { token },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setPredictionResult(data.success);
        const Doctor = doctors.filter(
          (doc) => doc.speciality === "Endocrinologist"
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
      }
    } catch (error) {
      toast.error("Prediction failed. Please try again.");
      setPredictionResult("");
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <div className="w-1/2 bg-red-100">
        <div className="w-full h-full  p-4 bg-blue-50 rounded-lg shadow-md">
          <h2 className="text-2xl w-full font-semibold mb-6 text-center">
            Diabetes Disease Prediction Form
          </h2>

          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Name
            </label>
            <p id="name" className="mb-4">
              {userData.name}
            </p>
            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg py-1 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg py-1 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <label
                  htmlFor="pregnancies"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Pregnancies No
                </label>
                <input
                  id="pregnancies"
                  type="text"
                  onChange={(e) => setPregnancies(e.target.value)}
                  className="block py-1 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="glucose"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Glucose level
                </label>
                <input
                  id="glucose"
                  type="text"
                  onChange={(e) => setGlucose(e.target.value)}
                  className="block w-full py-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <label
                  htmlFor="bp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  BloodPressure mmHg
                </label>
                <input
                  id="bp"
                  type="text"
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="block py-1 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="bmi"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  BMI :
                </label>
                <input
                  id="bmi"
                  type="text"
                  onChange={(e) => setBmi(e.target.value)}
                  className="block w-full py-1 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <label
                  htmlFor="sk"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Skin Thickness mm
                </label>
                <input
                  id="sk"
                  type="text"
                  onChange={(e) => setSkinThickness(e.target.value)}
                  className="block py-1 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="insulin"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Insulin level
                </label>
                <input
                  id="insulin"
                  type="text"
                  onChange={(e) => setInsulin(e.target.value)}
                  className="block py-1 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
              </div>
            </div>

            <label
              htmlFor="dp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Diabetes Pedigree Function
            </label>
            <input
              id="dp"
              type="text"
              onChange={(e) => setDiabetesPedigreeFunction(e.target.value)}
              className="block w-full py-1 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />

            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-1 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </div>

          <button
            onClick={predict}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-md shadow-md transition duration-300 mb-4"
          >
            Click for Prediction
          </button>
        </div>
      </div>

      <h2 className="text-gray-800 font-semibold mb-2 text-center">
        Result Shown Here
      </h2>

      {predictionResult !== null && (
        <div
          className={`p-4 rounded-md w-full ${
            predictionResult ? "bg-red-50" : "bg-green-50"
          }`}
        >
          {predictionResult ? (
            <>
              <p className="text-red-700 font-semibold mb-2">
                Our analysis indicates the presence of a medical condition. It's
                important to consult a healthcare professional promptly for a
                comprehensive evaluation and appropriate care.​
              </p>
              <h3 className="text-red-700 font-semibold mb-2">
                {isLocation
                  ? `Recommended Specialists:Near You ${location}`
                  : "No Doctor at Your Location Recommended Specialists off all doctor of that Disease"}
              </h3>

              {
                <div className="w-full grid  grid-cols-auto gap-4 gap-y-6">
                  {Doc.map((item, index) => (
                    <div
                      onClick={() => navigate(`/appointments/${item._id}`)}
                      className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
                      key={index}
                    >
                      <img className="bg-blue-50" src={item.image} />
                      <div className="p-4">
                        <div
                          className={`flex items-center gap-2 text-sm text-center ${
                            item.available ? "text-green-500 " : "text-red-500"
                          }`}
                        >
                          <p
                            className={`w-2 h-2 ${
                              item.available ? "bg-green-500 " : "bg-red-500"
                            } rounded-full`}
                          ></p>
                          <p>
                            {item.available ? "Available" : " Not Available"}
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
              }
            </>
          ) : (
            <p className="text-green-700 font-semibold">
              Great news! Your health checkup indicates no signs of disease.
              You're in good health, and there's no cause for concern. Continue
              maintaining a healthy lifestyle, and remember that regular
              checkups are key to staying on top of your well-being.​
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Diabetes;
