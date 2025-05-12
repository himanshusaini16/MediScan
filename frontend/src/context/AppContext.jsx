import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || false);
  const [userData, setUserData] = useState(false);
  const [socket, setSocket] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const loadAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctors/list`);
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  useEffect(() => {
    const newSocket = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket"],
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [backendUrl]);

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) loadUserProfileData();
    else setUserData(false);
  }, [token]);

  const sendMessage = async (room, message, senderRole = "user") => {
    try {
      const endpoint =
        senderRole === "user"
          ? "/api/chat/sendMessage"
          : "/api/chat/sendDoctorMessage";

      const formData = new FormData();
      formData.append("room", room);
      formData.append("text", message.text);
      formData.append("type", message.type || "text");

      if (senderRole === "user") formData.append("userId", userData._id);
      if (senderRole === "doctor") formData.append("docId", userData._id);

      if (message.image) {
        formData.append("image", message.image);
      }

      const { data } = await axios.post(`${backendUrl}${endpoint}`, formData, {
        headers: {
          token,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        socket?.emit("send-message", { room, message: data.data });
        return data.data;
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getRoomMessages = async (room) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/chat/getMessages/${room}`,
        {
          headers: { token },
        }
      );
      return data.success ? data.messages : [];
    } catch (err) {
      toast.error(err.message);
      return [];
    }
  };

  const value = {
    doctors,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
    socket,
    sendMessage,
    getRoomMessages,
    loadAppointments,
    appointments,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
