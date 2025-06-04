import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const History = () => {
  const { token, backendUrl } = useContext(AppContext);
  const [prediction, setPredictionData] = useState([]);
  const [disease, setDisease] = useState("");

  const historyData = async (diseaseName) => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/user/prediction-history/${diseaseName}`,
        { headers: { token } }
      );

      if (data.success) {
        setPredictionData(data.prediction);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      [];
    }
  }, [token]);

  const timestamp = Date.now();
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isoString = "2025-04-24T10:09:23.853+00:00";
  const date1 = new Date(isoString);
  const formattedDate1 = date1.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-semibold text-center text-gray-900">
        PREDICTION HISTORY
      </p>

      <div className="w-1/2">
        <select
          value={disease}
          onChange={(e) => {
            if (e.target.value === "") {
              setPredictionData([]);
            } else {
              historyData(e.target.value);
            }
            setDisease(e.target.value);
          }}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2 bg-gray-50 focus:outline-none font-semibold focus:ring-2 focus:ring-blue-500 mb-4"
        >
          <option value="">Select Disease To view History</option>
          <option value="Diabetes">Diabetes</option>
          <option value="Varicose">Varicose</option>
          <option value="heartdisease">Heart Disease</option>
          <option value="eyedisease">Eye Disease</option>
          <option value="skincancer">Skin Cancer Disease</option>
        </select>
      </div>

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[1fr_3fr_3fr_3fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Disease Name</p>
          <p>Date & Time</p>
          <p>Result</p>
        </div>

        {prediction.reverse().map((item, index) => (
          <div
            key={index}
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid grid-cols-[1fr_3fr_3fr_3fr] grid-flow-col  items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-100"
          >
            <p className="max-sm:hidden ">{index + 1}</p>
            <div className="flex items-center gap-2">
              <p>{disease}</p>
            </div>
            <p>
              {item.date
                ? new Date(item.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : " "}
            </p>

            {item.isPositive ? (
              <p className="text-red-500 text-xs font-medium">Positive</p>
            ) : (
              <p className="text-green-500 text-xs font-medium">Negative</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
