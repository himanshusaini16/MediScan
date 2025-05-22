import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { FaCartShopping } from "react-icons/fa6";


const Medicine = () => {
  const { category } = useParams();
  const { medicine, getMedicine, addToCart, cart,} = useContext(AppContext);

  const [filterMed, setFilterMed] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [loadingIds, setLoadingIds] = useState(new Set());

  const navigate = useNavigate();

  const applyFilter = () => {
    if (category) {
      setFilterMed(medicine.filter((med) => med.category === category));
    } else {
      setFilterMed(medicine);
    }
  };

  useEffect(() => {
    getMedicine();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [medicine, category]);

  const handleQuantityChange = (id, value) => {
    setQuantities((prev) => ({ ...prev, [id]: parseInt(value) }));
  };

  const handleAddToCart = async (med) => {
  const qty = quantities[med._id] || 1;

  if (qty > med.stock) {
    toast.error("Quantity exceeds available stock");
    return;
  }

  setLoadingIds((prev) => new Set(prev).add(med._id));

  try {
    await addToCart(med, qty);
    setFilterMed((prev) =>
      prev.map((m) =>
        m._id === med._id ? { ...m, stock: m.stock - qty } : m
      )
    );
  } catch (error) {
    const msg =
      error.response?.data?.message || error.message || "Failed to add to cart.";
    toast.error(msg);
  } finally {
    setLoadingIds((prev) => {
      const copy = new Set(prev);
      copy.delete(med._id);
      return copy;
    });
  }
};
  return (
    <div className="relative p-4">
    
      <div
        className="absolute top-4 right-4 w-8 h-8 text-primary text-2xl cursor-pointer hover:text-indigo-500 transition-all"
        onClick={() => navigate("/cart")}
        title="Go to Cart"
      >
        <FaCartShopping />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cart.length}
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-gray-600 text-xl font-semibold mb-3">
        Browse Medicines by Category
      </p>

      {/* Filter and Medicines */}
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        {/* Filter toggle for small screens */}
        <button
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${
            showFilter ? "bg-blue-600 text-white" : ""
          }`}
          onClick={() => setShowFilter((prev) => !prev)}
        >
          Filters
        </button>

        {/* Filter categories */}
        <div
          className={`flex-col gap-4 text-sm text-gray-600 ${
            showFilter ? "flex" : "hidden sm:flex"
          }`}
        >
          {[
            "General Medicine",
            "Heart Medicine",
            "Cancer Medicine",
            "Vericose Medicine",
            "Diabetes Medicine",
            "Eye Medicine",
          ].map((cat) => (
            <p
              key={cat}
              onClick={() =>
                category === cat
                  ? navigate("/medicine-store")
                  : navigate(`/medicine-store/${cat}`)
              }
              className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
                category === cat ? "bg-blue-100 text-black" : ""
              }`}
            >
              {cat}
            </p>
          ))}
        </div>

        {/* Medicines Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-6">
          {filterMed.map((item) => (
            <div
              key={item._id}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-5px] transition-all duration-300"
            >
              <img
                className="bg-blue-50 w-full h-40 object-contain"
                src={item.image}
                alt={item.name}
              />
              <div className="p-4">
                <p className="text-gray-900 text-lg font-semibold">{item.name}</p>
                <p className="text-gray-600 text-sm">{item.diseaseName}</p>
                <p className="text-sm mt-1 text-green-600 font-bold">₹{item.price}</p>
                <p className="text-xs mt-1 text-gray-500">{item.description}</p>
                <p className="text-xs mt-1 text-gray-500">
                  Expiry: {new Date(item.expiryDate).toLocaleDateString()}
                </p>
                <p className="text-xs mt-1 text-gray-500">In Stock: {item.stock}</p>

                {/* Quantity Selector */}
                <div className="mt-3 flex items-center gap-2">
                  <label htmlFor={`qty-${item._id}`} className="text-sm text-gray-600">
                    Qty:
                  </label>
                  <select
                    id={`qty-${item._id}`}
                    className="border px-2 py-1 text-sm rounded"
                    value={quantities[item._id] || 1}
                    onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                    disabled={item.stock === 0}
                  >
                    {Array.from({ length: item.stock }, (_, i) => i + 1).map((qty) => (
                      <option key={qty} value={qty}>
                        {qty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.stock === 0 || loadingIds.has(item._id)}
                  className="mt-3 w-full bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {loadingIds.has(item._id)
                    ? "Adding..."
                    : item.stock === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Medicine;
