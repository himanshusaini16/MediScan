import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { FaShoppingCart, FaClipboardList } from "react-icons/fa";
import { toast } from "react-toastify";

const Cart = () => {
  const { backendUrl, token, setCart, userData } = useContext(AppContext);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [activeTab, setActiveTab] = useState("cart");
  const [allOrders, setAllOrders] = useState([]);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/all-order`, {
        headers: { token },
      });
      if (data.orders) {
        const reversedOrders = data.orders.reverse();
        setAllOrders(reversedOrders);
        const unpaid = reversedOrders.find((o) => !o.isPaid);
        setCart(unpaid?.medicines || []);
        setCurrentOrderId(unpaid?._id || null);
      }
    } catch (error) {
      // console.error("Failed to fetch orders", error);
    }
  };

  const handlePlaceOrder = async () => {
    const unPaid = allOrders.filter((order) => !order.isPaid);
    if (!unPaid.length || !unPaid[0]?.medicines?.length) {
      toast.warning("Cart is empty");
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/createorder`,
        { orderId: currentOrderId, paymentMethod },
        { headers: { token } }
      );

      if (data.success && data.order) {
        if (paymentMethod === "online") {
          initRazorpay(data.order);
        } else {
          toast.success("Order placed with Cash on Delivery");
          setCart([]);
          fetchAllOrders();
          setActiveTab("orders");
        }
      } else {
        toast.error("Failed to place order.");
      }
    } catch (err) {
      // console.error("Create order error:", err);
      toast.error("Something went wrong.");
    }
  };

  const initRazorpay = (razorpayOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Medicine payment",
      description: "Medicine Payment",
      order_id: razorpayOrder.id,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/confirmorder`,
            { razorpay_order_id: response.razorpay_order_id },
            { headers: { token } }
          );

          if (data.success) {
            toast.success("Payment successful");
            setCart([]);
            fetchAllOrders();
            setActiveTab("orders");
          } else {
            toast.error("Payment verification failed");
          }
        } catch (err) {
          console.error("Confirm payment error:", err);
          toast.error("Payment confirmation failed");
        }
      },
      prefill: {
        name: userData.name,
        email: userData.email,
      },
      theme: { color: "#6366f1" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const paidOrders = allOrders.filter((order) => order.isPaid);
  const unPaid = allOrders.filter((order) => !order.isPaid);
  const unpaidMedicines = unPaid[0]?.medicines || [];

  const total = unpaidMedicines.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your Cart & Orders
      </h1>

      <div className="flex justify-start gap-4 mb-8">
        <button
          onClick={() => setActiveTab("cart")}
          className={`flex items-center gap-2 px-6 py-2 rounded ${
            activeTab === "cart"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <FaShoppingCart size={20} />
          My Cart
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-6 py-2 rounded ${
            activeTab === "orders"
              ? "bg-yellow-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <FaClipboardList size={20} />
          My Orders
        </button>
      </div>

      {activeTab === "cart" && (
        <>
          {unpaidMedicines.length === 0 ? (
            <p className="text-center text-gray-500 mb-12">
              Your cart is empty.
            </p>
          ) : (
            <>
              <div className="space-y-6 mb-8">
                {unpaidMedicines.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row gap-6 items-center border p-4 rounded shadow bg-blue-50"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-32 h-32 object-cover border rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/fallback-image.png";
                      }}
                    />
                    <div className="flex-1 w-full">
                      <p className="font-semibold text-lg">{item.name}</p>
                      <p className="text-gray-600 text-sm truncate">
                        {item.description}
                      </p>
                      <p className="text-sm mt-1">
                        Expires:{" "}
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                      <p className="mt-1">
                        Price: ₹{item.price} | Qty: {item.quantity}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {item.medicineId}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        axios
                          .post(
                            `${backendUrl}/api/user/remove-cart`,
                            {
                              orderId: currentOrderId,
                              medicineId: item.medicineId,
                            },
                            { headers: { token } }
                          )
                          .then(() => {
                            toast.success("Item removed");
                            fetchAllOrders();
                          })
                          .catch(() => toast.error("Failed to remove item"));
                      }}
                      className="text-red-600 border border-red-600 px-4 py-1 rounded hover:bg-red-600 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-right text-xl font-bold mb-6">
                Total: ₹{total.toFixed(2)}
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">
                  Choose Payment Method:
                </h2>
                <div className="flex gap-6">
                  <label>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                    <span className="ml-2">Cash on Delivery</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                    />
                    <span className="ml-2">Online Payment</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full sm:w-auto px-6 py-3 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition-all"
              >
                Place Order
              </button>
            </>
          )}
        </>
      )}

      {activeTab === "orders" && (
        <>
          {paidOrders.length === 0 ? (
            <p className="text-center text-gray-500">
              No completed orders found. Please check your cart for pending
              payments.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paidOrders.map((order) => {
                const orderTotal = order.medicines.reduce(
                  (acc, item) => acc + item.price * item.quantity,
                  0
                );
                return (
                  <div
                    key={order._id}
                    className="border p-6 rounded-xl shadow-lg bg-gradient-to-br from-white to-gray-100"
                  >
                    <div className="flex justify-between mb-4 items-center">
                      <p className="text-lg font-semibold text-indigo-700">
                        {order.paymentMethod === "cash"
                          ? "Cash on Delivery"
                          : "Paid Online"}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Order ID: <span className="font-mono">{order._id}</span>
                      </p>
                    </div>
                    <div className="space-y-4">
                      {order.medicines.map((item) => (
                        <div
                          key={item._id}
                          className="flex flex-col sm:flex-row items-center gap-4 border rounded p-3 bg-white"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded border"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/fallback-image.png";
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.description}
                            </p>
                            <p className="text-sm">
                              ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-right mt-4 text-lg font-bold text-green-600">
                      Total: ₹{orderTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;
