import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const MedicineList = () => {
  const { aToken, medicines, getAllMedicine, deleteMedicine, backendUrl } =
    useContext(AdminContext);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ stock: "", expiryDate: "" });

  useEffect(() => {
    if (aToken) {
      getAllMedicine();
    }
  }, [aToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSave = async (id) => {
    try {
      const res = await axios.post(
        backendUrl + "/api/admin/editMedicine",
        {
          medicineId: id,
          stock: Number(editData.stock),
          expiryDate: editData.expiryDate,
        },
        {
          headers: {
            aToken,
          },
        }
      );
      if (res.data.success) {
        toast.success("Medicine updated successfully");
        setEditingId(null);
        getAllMedicine();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Error updating medicine"
      );
      // console.log(err)
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="m-5 max-h-[90vh] overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6 text-indigo-800">Medicines</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {medicines.map((item, index) => {
          const isEditing = editingId === item._id;

          return (
            <div
              key={index}
              className="border border-indigo-200 rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover bg-indigo-50"
              />
              <div className="p-4 space-y-1 text-sm">
                <p className="font-semibold text-indigo-900 text-base">
                  {item.name}
                </p>
                <p className="text-gray-600">
                  Manufacturer:{" "}
                  <span className="font-medium">{item.manufacturer}</span>
                </p>
                <p className="text-gray-600">
                  Description:{" "}
                  <span className="font-light">{item.description}</span>
                </p>
                <p className="text-gray-600">
                  Disease:{" "}
                  <span className="font-medium">{item.diseaseName}</span>
                </p>

                <p className="text-gray-600">
                  Stock:{" "}
                  {isEditing ? (
                    <input
                      type="number"
                      name="stock"
                      value={editData.stock}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-20"
                      min={0}
                    />
                  ) : (
                    <span className="font-medium">{item.stock}</span>
                  )}
                </p>

                <p className="text-gray-600">
                  Expiry:{" "}
                  {isEditing ? (
                    <input
                      type="date"
                      name="expiryDate"
                      value={editData.expiryDate}
                      onChange={handleChange}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    <span className="font-medium">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </span>
                  )}
                </p>

                <p className="text-gray-600">
                  Price:{" "}
                  <span className="font-medium text-green-500">
                    ₹{item.price}
                  </span>
                </p>
                <p className="text-gray-600">
                  Category: <span className="font-medium">{item.category}</span>
                </p>

                {isEditing ? (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleSave(item._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 border border-gray-400 rounded hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setEditingId(item._id);
                        setEditData({
                          stock: item.stock,
                          expiryDate: item.expiryDate.slice(0, 10),
                        });
                      }}
                      className="px-3 py-1 border border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMedicine(item._id)}
                      className="px-3 py-1 border text-red-500 border-red-500 hover:bg-red-600 hover:text-white rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MedicineList;
