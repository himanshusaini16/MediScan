import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Message = () => {
  const { backendUrl, token, loadUserProfileData, userData } =
    useContext(AppContext);
  const [message, setMessage] = useState([]);
  const [userId, setUserId] = useState("");

  const navigate = useNavigate();

  const getMessagelist = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      if (data.success) {
        setMessage(data.appointments.reverse());
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getMessagelist();
    }
  }, [token]);

  useEffect(() => {
    loadUserProfileData();
    setUserId(userData._id);
  }, [token]);

  const uniqueDoctors = Array.from(
    new Map(message.map((item) => [item.docId, item])).values()
  );

  return (
    <div className="p-4">
      <div className="space-y-2">
        {uniqueDoctors.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-100 hover:bg-white p-4 rounded shadow-md"
          >
            <div className="flex items-center space-x-4">
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={item.docData.image}
                alt="Doctor"
              />
              <div>
                <p className="font-semibold">{item.docData.name}</p>
                <p className="text-sm text-gray-600">
                  {item.docData.speciality}
                </p>
              </div>
            </div>

            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => navigate(`/chat/${userId + "_" + item.docId}`)}
            >
              Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Message;
