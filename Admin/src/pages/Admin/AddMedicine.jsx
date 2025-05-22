import React, { useState, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from "../../assets/assets";

const AddMedicine = () => {
  const [medicineImg, setMedicineImg] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [medicinename, setMedicienename] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("General");
  const [expiryDate, setExpirydate] = useState("");
  const [diseaseName, setDiseasename] = useState("");

  const { backendUrl, aToken } = useContext(AdminContext);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setMedicineImg(file);
    setPreviewImg(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setMedicineImg(null);
    setPreviewImg(null);
    setMedicienename("");
    setManufacturer("");
    setDescription("");
    setPrice("");
    setStock("");
    setQuantity(1);
    setCategory("General");
    setExpirydate("");
    setDiseasename("");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!medicineImg) {
      toast.error("Please upload an image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", medicineImg);
      formData.append("name", medicinename);
      formData.append("manufacturer", manufacturer);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", Number(stock));
      formData.append("quantity", Number(quantity));
      formData.append("category", category);
      formData.append("expiryDate", expiryDate);
      formData.append("diseaseName", diseaseName);

      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-medicine`,
        formData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message || "Medicine added successfully!");
        resetForm();
      } else {
        toast.error(data.message || "Failed to add medicine.");
      }
    } catch (error) {
      toast.error("An error occurred while adding medicine.");
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="m-5 w-full max-w-6xl mx-auto text-gray-700"
    >
      <p className="text-2xl font-bold mb-6">Add New Medicine</p>

      <div className="bg-blue-50 p-8 rounded shadow border max-h-[80vh] overflow-y-auto">
        <div className="flex items-center gap-4 mb-8">
          <label htmlFor="medicine-img" className="cursor-pointer">
            <img
              className="w-20 h-20 object-cover bg-gray-100 border rounded"
              src={previewImg || assets.upload_area}
              alt="Upload Medicine"
            />
          </label>
          <input
            id="medicine-img"
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
          <div>
            <p className="font-medium">Upload Medicine Image</p>
            <p className="text-sm text-gray-500">Click the image to select</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <label>Medicine Name</label>
            <input
              type="text"
              placeholder="Paracetamol"
              className="border rounded px-4 py-2"
              value={medicinename}
              onChange={(e) => setMedicienename(e.target.value)}
              required
            />

            <label>Manufacturer</label>
            <input
              type="text"
              placeholder="Pfizer"
              className="border rounded px-4 py-2"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              required
            />

            <label>Description</label>
            <textarea
              placeholder="Short description"
              rows={3}
              className="border rounded px-4 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <label>Price (in ₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="20.00"
              className="border rounded px-4 py-2"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            <label>Stock</label>
            <input
              type="number"
              min="0"
              placeholder="100"
              className="border rounded px-4 py-2"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-3">
            <label>Quantity (per unit)</label>
            <input
              type="number"
              min="1"
              placeholder="1"
              className="border rounded px-4 py-2"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            <label>Category</label>
            <select
              className="border rounded px-4 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Heart Medicine">Heart Medicine</option>
              <option value="Cancer Medicine">Cancer Medicine</option>
              <option value="Vericose Medicine">Vericose Medicine</option>
              <option value="Diabetes Medicine">Diabetes Medicine</option>
              <option value="Eye Medicine">Eye Medicine</option>
            </select>

            <label>Expiry Date</label>
            <input
              type="date"
              className="border rounded px-4 py-2"
              value={expiryDate}
              onChange={(e) => setExpirydate(e.target.value)}
              required
            />

            <label>Disease Name</label>
            <input
              type="text"
              placeholder="Fever"
              className="border rounded px-4 py-2"
              value={diseaseName}
              onChange={(e) => setDiseasename(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition duration-300"
        >
          Add Medicine
        </button>
      </div>
    </form>
  );
};

export default AddMedicine;
