import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const DoctorProfile = () => {
  const {
    dToken,
    profileData,
    setProfileData,
    getProfileData,
    backendUrl,
    getAppointments,
  } = useContext(DoctorContext);

  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [parsedAddress, setParsedAddress] = useState({ line1: "", line2: "" });

  // When profileData loads, parse address string to object
  useEffect(() => {
    if (profileData?.address) {
      try {
        setParsedAddress(JSON.parse(profileData.address));
      } catch (error) {
        setParsedAddress({ line1: "", line2: "" });
      }
    }
  }, [profileData]);

  useEffect(() => {
    if (dToken) {
      getProfileData();
      getAppointments();
    }
  }, [dToken]);

  const updateProfile = async () => {
    try {
      const updateData = {
        address: JSON.stringify(parsedAddress), // stringify before sending
        fees: profileData.fees,
        available: profileData.available,
      };

      const { data } = await axios.post(
        backendUrl + "/api/doctors/update-profile",
        updateData,
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    profileData && (
      <div>
        <div className="flex flex-col gap-4 m-5">
          <div>
            <img
              className="bg-primary/80 w-full sm:max-w-64 rounded-lg "
              src={profileData.image}
              alt=""
            />
          </div>

          <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
            {/* name degree experience */}
            <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
              {profileData.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <p>
                {profileData.degree} - {profileData.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {profileData.experience}
              </button>
            </div>

            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3">
                About
              </p>
              <p className="text-sm text-gray-600 max-w-[700px] mt-1">
                {profileData.about}
              </p>
            </div>

            <p className="text-gray-600 font-medium mt-4">
              Appointment Fee :
              <span className="text-gray-800">
                {currency}
                {isEdit ? (
                  <input
                    type="number"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        fees: e.target.value,
                      }))
                    }
                    value={profileData.fees}
                  />
                ) : (
                  profileData.fees
                )}
              </span>
            </p>

            <div className="flex gap-2 py-2">
              <p>Address:</p>
              <p className="text-sm">
                {isEdit ? (
                  <>
                    <input
                      type="text"
                      onChange={(e) =>
                        setParsedAddress((prev) => ({
                          ...prev,
                          line1: e.target.value,
                        }))
                      }
                      value={parsedAddress.line1}
                      placeholder="Line 1"
                      className="mb-1"
                    />
                    <br />
                    <input
                      type="text"
                      onChange={(e) =>
                        setParsedAddress((prev) => ({
                          ...prev,
                          line2: e.target.value,
                        }))
                      }
                      value={parsedAddress.line2}
                      placeholder="Line 2"
                    />
                  </>
                ) : (
                  <>
                    {parsedAddress.line1}
                    <br />
                    {parsedAddress.line2}
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-1 pt-1 items-center">
              <input
                onChange={() =>
                  isEdit &&
                  setProfileData((prev) => ({
                    ...prev,
                    available: !prev.available,
                  }))
                }
                type="checkbox"
                checked={profileData.available}
                id="available-checkbox"
              />
              <label htmlFor="available-checkbox">Available</label>
            </div>
            {isEdit ? (
              <button
                onClick={updateProfile}
                className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorProfile;
