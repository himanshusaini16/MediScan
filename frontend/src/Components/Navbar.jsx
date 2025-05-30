import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaUserDoctor } from "react-icons/fa6";
import { FaRegListAlt } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { token, setToken, userData } = useContext(AppContext);

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-grey-400">
      <img
        onClick={() => navigate("/")}
        className="w-44 h-10 cursor-pointer"
        src="/logo.png"
        alt="Logo"
      />

      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center gap-5 font-medium">
        <NavLink to="/">
          <li className="py-1 flex items-center gap-2">
            <i className="fas fa-home text-primary"></i>
            HOME
          </li>
        </NavLink>

        <NavLink to="/disease-list">
          <li className="py-1 flex items-center gap-2">
            <FaRegListAlt className="w-4 h-4 text-primary" />
            DISEASE LIST
          </li>
        </NavLink>

        <NavLink to="/doctors">
          <li className="py-1 flex items-center gap-2">
            <FaUserDoctor className="w-4 h-4 text-primary" />
            ALL DOCTOR
          </li>
        </NavLink>

        <NavLink to="/medicine-store">
          <li className="py-1 flex items-center gap-2">
            <i className="fas fa-capsules text-primary"></i>
            MEDICINE STORE
          </li>
        </NavLink>

        <NavLink to="/about">
          <li className="py-1 flex items-center gap-2">
            <i className="fas fa-info-circle text-primary"></i>
            ABOUT
          </li>
        </NavLink>

        <NavLink to="/contact">
          <li className="py-1 flex items-center gap-2">
            <i className="fas fa-envelope text-primary"></i>
            CONTACT
          </li>
        </NavLink>
      </ul>

      <div className="flex items-center gap-2">
        {/* Show medicine store icon in mobile */}
        <div className="flex gap-3 md:hidden items-center">
          <NavLink to="/disease-list" className="relative group">
            <FaRegListAlt className="text-xl text-blue-600" />
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Disease List
            </span>
          </NavLink>

          {/* <NavLink to="/doctors" className="relative group">
    <FaUserDoctor className=' text-blue-600 text-xl'/>
    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
      All Doctor
    </span>
  </NavLink> */}

          <NavLink to="/medicine-store" className="relative group">
            <i className="fas fa-capsules text-xl text-blue-600"></i>
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Medicine Store
            </span>
          </NavLink>
        </div>

        {token && userData ? (
          <>
            {userData?.role === "user" && (
              <div className="relative group">
                <button
                  className="relative p-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent menu open
                    navigate("/message");
                  }}
                >
                  <i className="fas fa-comment-dots text-xl text-primary mr-4"></i>
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 cursor-pointer group relative">
              <img
                className="w-8 rounded-full"
                src={userData.image}
                alt="Profile"
              />
              <img
                className="w-2.5"
                src={assets.dropdown_icon}
                alt="Dropdown"
              />

              <div className="absolute top-0 right-0 pt-14 rounded-lg text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  <p
                    onClick={() => navigate("/my-profile")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate("/my-appointments")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Appointments
                  </p>
                  <p
                    onClick={() => navigate("/prediction-history")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Prediction History
                  </p>
                  <p
                    onClick={logout}
                    className="hover:text-black cursor-pointer"
                  >
                    Log Out
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-6 py-3 rounded-full font-light hidden md:block"
          >
            CREATE ACCOUNT
          </button>
        )}

        {/* Mobile Menu Icon */}
        <img
          id="mobile-menu-toggle"
          onClick={(e) => {
            if (e.target.id === "mobile-menu-toggle") {
              setShowMenu(true);
            }
          }}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt="Menu"
        />

        {/* Mobile Menu */}
        <div
          className={`${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-30" src="/logo.png" alt="Logo" />
            <img
              className="w-7"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt="Close"
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded inline-block">HOME</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded inline-block">ALL DOCTOR</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/disease-list">
              <p className="px-4 py-2 rounded inline-block">DISEASE LIST</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/medicine-store">
              <p className="px-4 py-2 rounded inline-block">MEDICINE STORE</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded inline-block">ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded inline-block">CONTACT</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
