// eslint-disable-next-line no-unused-vars
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyAppointements = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
    );
  };

  const navigate = useNavigate();
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response);

        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verifyRazorpay",
            response,
            { headers: { token } }
          );
          if (data.success) {
            toast.success(data.message);
            getUserAppointments();
            navigate("/my-appointments");
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-razorpay",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        initPay(data.order);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointements
      </p>
      <div>
        {appointments.slice(0, visibleCount).map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img className="w-32 bg-indigo-50 " src={item.docData.image} />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>

              {(() => {
                let addressObj = {};
                try {
                  addressObj =
                    typeof item.docData.address === "string"
                      ? JSON.parse(item.docData.address)
                      : item.docData.address || {};
                } catch (err) {
                  addressObj = {};
                }

                return (
                  <>
                    <p className="text-xs">
                      {addressObj.line1 || "Address is not available"}
                    </p>
                    <p className="text-xs">{addressObj.line2 || ""}</p>
                  </>
                );
              })()}

              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:
                </span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div></div>

            <div className="flex flex-col gap-2 justify-end">
              {!item.cancelled && item.payment && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border rounded text-stone-700 bg-green-300">
                  Paid
                </button>
              )}
              {!item.cancelled && !item.payment && !item.isCompleted && (
                <button
                  onClick={() => appointmentRazorpay(item._id)}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Pay Online
                </button>
              )}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel Appointement
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500 ">
                  Appointement cancelled
                </button>
              )}

              {item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-green-600 rounded text-green-500">
                  Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {visibleCount < appointments.length && (
        <button
          onClick={() => setVisibleCount((prev) => prev + 3)}
          className="p-2 mt-4 border font-medium text-gray-900  border-gray-400 rounded hover:bg-primary transition-all duration-200"
        >
          View More
        </button>
      )}
    </div>
  );
};

export default MyAppointements;
