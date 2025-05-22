// eslint-disable-next-line no-unused-vars
import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

const Doctorlist = () => {
  const { doctors, aToken, getAllDoctors, changeAvalibility, deleteDoctor } =
    useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Doctors</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {doctors.map((item, index) => (
          <div
            className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer"
            key={index}
          >
            <img
              className="bg-indigo-50 hover:bg-primary transition-all duration-500"
              src={item.image}
              alt=""
            ></img>
            <div className="p-4">
              <p className="text-neutral-800 text-lg font-medium">
                {item.name}
              </p>
              <p className="text-zinc-600 text-sm">{item.speciality}</p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <input
                  onClick={() => changeAvalibility(item._id)}
                  type="checkbox"
                  checked={item.available}
                />
                <p>Available</p>
              </div>
              <button
                onClick={() => deleteDoctor(item._id)}
                className="mt-5 px-2 mb-15 py-1 border text-red-500 border-red-500 hover:bg-red-600 hover:text-white text-sm rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctorlist;
