import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const HeartDisease = () => {
  const { backendUrl, token, userData, doctors } = useContext(AppContext);
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [cp, setCp] = useState("");
  const [trestbps, setTrestbps] = useState("");
  const [chol, setChol] = useState("");
  const [fbs, setFbs] = useState("");
  const [restecg, setRestecg] = useState("");
  const [thalach, setThalach] = useState("");
  const [exang, setExang] = useState("");
  const [oldpeak, setOldPeak] = useState("");
  const [slope, setSlope] = useState("");
  const [ca, setCa] = useState("");
  const [thal, setThal] = useState("");
  const [location, setLocation] = useState("");

  const [predictionResult, setPredictionResult] = useState(null);
  const [Doc, setDoc] = useState([]);
  const [isLocation, SetIsLocation] = useState(null);
  const [confidence, setConfidence] = useState("");

  const navigate = useNavigate();

  const predict = async () => {
    try {
      if (!token) {
        toast.warn("Login to Predict the disease");
        return navigate("/login");
      }

      const predictionData = {
        userId: userData._id,
        age: parseInt(age),
        sex: parseInt(sex),
        cp: parseInt(cp),
        trestbps: parseInt(trestbps),
        chol: parseInt(chol),
        fbs: parseInt(fbs),
        restecg: parseInt(restecg),
        thalach: parseInt(thalach),
        exang: parseInt(exang),
        oldpeak: parseFloat(oldpeak),
        slope: parseInt(slope),
        ca: parseInt(ca),
        thal: parseInt(thal),
        location: location,
      };

      const { data } = await axios.post(
        `${backendUrl}/api/user/predict-heartDisease`,
        predictionData,
        {
          headers: { token },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setConfidence(data.confidence);
        setPredictionResult(data.success);

        const Doctor = doctors.filter(
          (doc) => doc.speciality === "Cardiologist"
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
      <div className="w-1/2 bg-green-100">
        <div className="w-full h-full p-4 bg-blue-100 rounded-lg shadow-md">
          <h2 className="text-2xl w-full font-semibold mb-6 text-center">
            Heart Disease Prediction Form
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <p className="mb-4">{userData.name}</p>

            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="1">Male</option>
                  <option value="0">Female</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mb-4 mt-4">
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chest Pain Type
                </label>
                <select
                  value={cp}
                  onChange={(e) => setCp(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                >
                  <option value="">Select Chest pain</option>
                  <option value="0">Typical Angina</option>
                  <option value="1">Atypical Angina</option>
                  <option value="2">Non-anginal Pain</option>
                  <option value="3">Asymptomatic</option>
                </select>
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resting BP (mm Hg)
                </label>
                <input
                  type="number"
                  value={trestbps}
                  onChange={(e) => setTrestbps(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                />
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Old Peak (ST Depression):
                </label>
                <input
                  type="number"
                  value={oldpeak}
                  onChange={(e) => setOldPeak(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cholesterol (mg/dl)
                </label>
                <input
                  type="number"
                  value={chol}
                  onChange={(e) => setChol(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasting Blood Sugar > 120 mg/dl
                </label>
                <select
                  value={fbs}
                  onChange={(e) => setFbs(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                >
                  <option value="">Select</option>
                  <option value="1">YES</option>
                  <option value="0">NO</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resting ECG Results (0-2)
                </label>
                <select
                  value={restecg}
                  onChange={(e) => setRestecg(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                >
                  <option value="">Select</option>
                  <option value="0">Normal</option>
                  <option value="1">Having ST-T wave abnormality</option>
                  <option value="2">
                    Showing probable or definite left ventricular hypertrophy
                  </option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Heart Rate Achieved
                </label>
                <input
                  type="number"
                  value={thalach}
                  onChange={(e) => setThalach(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Induced Angina
                </label>
                <select
                  value={exang}
                  onChange={(e) => setExang(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                >
                  <option value="">Select</option>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slope of Peak Exercise ST Segment:
                </label>
                <select
                  value={slope}
                  onChange={(e) => setSlope(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                >
                  <option value="">Select</option>
                  <option value="0">Upsloping</option>
                  <option value="1">Flat</option>
                  <option value="2">Downsloping</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CA
                </label>
                <select
                  value={ca}
                  onChange={(e) => setCa(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                >
                  <option value="">Select</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thalassemia:
                </label>
                <select
                  value={thal}
                  onChange={(e) => setThal(e.target.value)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
                  required
                >
                  <option value="">Select</option>
                  <option value="1">Normal</option>
                  <option value="2">Fixed defect</option>
                  <option value="3">Reversible defect</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="block w-full text-sm border border-gray-300 rounded-lg p-1 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={predict}
            className="w-full bg-primary hover:bg-primary text-white text-sm font-medium px-6 py-2 rounded-md shadow-md transition duration-300 mb-4"
          >
            Predict Heart Disease
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
                Our analysis indicates a possible heart condition, with a
                confidence level of &nbsp;
                <b className="text-red-800 underline">{confidence}</b>. Please
                consult a Cardiologist immediately for a detailed evaluation and
                appropriate medical guidance.
              </p>
              <h3 className="text-red-700 font-semibold mb-2">
                {isLocation
                  ? `Recommended Cardiologists near ${location}`
                  : "Recommended Cardiologists (no exact match for your location)"}
              </h3>
              <div className="w-full grid grid-cols-auto gap-4">
                {Doc.map((item, index) => (
                  <div
                    onClick={() => navigate(`/appointments/${item._id}`)}
                    className="border border-green-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500"
                    key={index}
                  >
                    <img
                      className="bg-green-50"
                      src={item.image}
                      alt="Doctor"
                    />
                    <div className="p-4">
                      <p className="text-center font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600 text-center">
                        {item.speciality}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-green-700 font-semibold">
              No heart disease detected. Stay healthy!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HeartDisease;
