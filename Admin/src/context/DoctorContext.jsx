import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { useContext } from "react";
import { SharedContext } from "@shared/context/SharedContext";



export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [dashData, setDashData] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [profileData, setProfileData] = useState("");
  // const [socket, setSocket] = useState(null);
  const{socket} = useContext(SharedContext)

  console.log("Socket from frontend folder import from app Context",socket)

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctors/appointments`,
        { headers: { dToken } }
      );
      if (data.success) {
        setAppointments(data.appiontments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctors/complete-appointment`,
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctors/cancel-appointment`,
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctors/dashboard`, {
        headers: { dToken },
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctors/profile`, {
        headers: { dToken },
      });
      if (data.success) {
        setProfileData(data.profileData);
        console.log("profile Data",data)
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // useEffect(() => {
  //   const newSocket = io(backendUrl, {
  //     withCredentials: true,
  //     transports: ["websocket"],
  //   });

  //   newSocket.on("connect", () => {
  //     console.log("Socket connected:", newSocket.id);
  //   });

  //   setSocket(newSocket);

  //   return () => {
  //     newSocket.close();
  //   };
  // }, [backendUrl]);

  const sendDoctorMessage = async (userId, message) => {
    try {
      if (!profileData._id) {
        toast.error("Doctor ID is missing.");
        return;
      }

      const docId = profileData._id;
      console.log(userId)
      const room = userId

      console.log('docid',docId)
      console.log('room',room)

      const formData = new FormData();
      formData.append("room", room);
      formData.append("text", message.text || "");
      formData.append("type", message.type || "text");
      formData.append("docId", docId);
      formData.append("userId", userId);

      if (message.image) {
        formData.append("image", message.image);
      }

      const { data } = await axios.post(
        `${backendUrl}/api/chat/sendDoctorMessage`,
        formData,
        {
          headers: {
            dToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        socket?.emit("send-message", { room, message: data.data });
        console.log(data)
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
      console.log("room from get message",room)
      const { data } = await axios.get(
        `${backendUrl}/api/chat/getMessagesByDoctor/${room}`,
        {
          headers: { dToken },
        }
      );
      console.log(data)
      return data.success ? data.messages : [];
    } catch (err) {
      toast.error(err.message);
      return [];
    }
  };

  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    socket,
    sendDoctorMessage,
    getRoomMessages,
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
