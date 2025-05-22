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
  const [medicine, setMedicine] = useState([]);
  const [cart, setCart] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/all-order`, {
        headers: { token },
      });
      if (data.orders) {
        setCart(data.orders[0]?.medicines || []);
      }
    } catch (error) {
      // console.error("Failed to fetch orders", error);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const addToCart = async (item, quantity) => {
    if (!token) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-to-cart`,
        {
          medicineId: item._id,
          quantity,
        },
        {
          headers: {
            token,
          },
        }
      );

      // console.log("Add to cart response:", data);

      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex((i) => i._id === item._id);

        if (existingIndex !== -1) {
          const updatedCart = [...prevCart];
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: updatedCart[existingIndex].quantity + quantity,
          };

          const [updatedItem] = updatedCart.splice(existingIndex, 1);
          return [updatedItem, ...updatedCart];
        }

        return [{ ...item, quantity }, ...prevCart];
      });

      toast.success(`${item.name} added to cart!`, { autoClose: 1500 });
    } catch (error) {
      // console.error("Add to cart error:", error);
      toast.error(
        "Failed to add item to cart: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // console.log("cart form app", cart);
  const removeFromCart = async (orderId, medicineId) => {
    // console.log("removeFromCart called with:", { orderId, medicineId });

    if (!orderId) {
      // console.error("removeFromCart error: Missing orderId");
      return;
    }

    if (!medicineId) {
      // console.error("removeFromCart error: Missing medicineId");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/stock-add`,
        { orderId, medicineId },
        {
          headers: { token },
        }
      );

      // console.log("Response from remove-from-order:", response.data);

      setCart((prevCart) => prevCart.filter((item) => item._id !== medicineId));

      toast.success("Item removed and stock updated.");
    } catch (error) {
      if (error.response) {
        console.error(
          "Error response from server:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        // console.error("No response received:", error.request);
      } else {
        // console.error("Error setting up request:", error.message);
      }
      toast.error("Failed to remove item: " + error.message);
    }
  };

  const loadAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
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

  const getMedicine = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/medicine`);
      if (data.success) {
        setMedicine(data.medicine);
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

  // Socket.IO connection
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
    getMedicine();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
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
    medicine,
    getMedicine,
    cart,
    addToCart,
    removeFromCart,
    setCart,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
