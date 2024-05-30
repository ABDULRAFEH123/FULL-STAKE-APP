"use client";
import React from "react";
import { useSession, signIn, getSession } from "next-auth/react";

import { TbSettingsShare } from "react-icons/tb";
import { useState, useEffect } from "react";
const Modal = ({ show, onClose }) => {
  const { data: session, update } = useSession();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");

  // Event handlers for input changes
  const handleNameChange = (event) => setName(event.target.value);
  const handleLocationChange = (event) => setLocation(event.target.value);
  const handleAboutChange = (event) => setAbout(event.target.value);
  // When the component mounts and session is available, set the input value
 
  useEffect(() => {
    if (session) {
      setName(session.user.name || '');
      setLocation(session.user.location || '');
      setAbout(session.user.about || '');
    }
  }, [session]);// Only re-run if the session's user name changes
  // Function to update user details
  const updateUserDetails = async () => {
  
    const response = await fetch("/api/backend/updateprofile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.user?.accessToken}`, // Ensure the accessToken is passed correctly
      },
      body: JSON.stringify({ name, location, about }),
    });
  
    if (response.ok) {
      const updatedUser = await response.json();
      console.log(updatedUser, "api called successfully");
  
    
      // Manually trigger a session update
      const updatedSession = {
        ...session,
        user: {
          ...session.user,
          name: updatedUser.name,
          location: updatedUser.location,
          about: updatedUser.about,
        },
      };

      await update(updatedSession);

      // console.log("Session updated:", updatedSession);
  
      onClose();
    } else {
      console.error("Failed to update user");
    }
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 p-2">
      <article className="bg-white max-h-[90vh] max-w-[500px] mx-auto rounded-[16px] overflow-hidden flex flex-col shadow-[0_15px_30px_0_rgba(0,0,0,0.25)] sm:w-[90%]">
        <header className="p-4 border-b border-[#ddd] flex items-center justify-between">
          <h1 className="flex items-center gap-2 leading-[1] font-bold text-[1.125rem] text-black">
            <TbSettingsShare size={30} />
            Update Your Profile
          </h1>
          <button
            className="p-0 border-0 bg-transparent  text-black w-10 h-10 flex items-center justify-center leading-[1] cursor-pointer rounded-[8px] transition-[0.15s_ease] hover:bg-[#dfdad7]"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path
                fill="currentColor"
                d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"
              />
            </svg>
          </button>
        </header>
        {/* MAIN CONTNET OF THE PROFILE.. */}
        <form className="p-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm  font-medium text-black"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              onChange={handleNameChange}
              value={name}
              className="mt-1 block w-full  px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#750550] focus:border-[#750550]"
            />
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-black"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={location}
              onChange={handleLocationChange}
              className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#750550] focus:border-[#750550]"
            />
          </div>
          <div>
            <label
              htmlFor="about"
              className="block text-sm font-medium text-black"
            >
              About
            </label>
            <textarea
              id="about"
              name="about"
              value={about}
              onChange={handleAboutChange}
              rows="4"
              className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#750550] focus:border-[#750550]"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={session?.user?.email || "No data found"}
              className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-gray-200 focus:border-gray-200"
              disabled
            />
          </div>
        </form>

        <footer className="p-5 flex items-center justify-end border-t border-[#ddd] gap-3 relative">
          <button
            onClick={onClose}
            className="px-5 py-3 text-white rounded-[8px] bg-[#f02121c2] border-0 font-semibold cursor-pointer transition-[0.15s_ease] "
          >
            Decline
          </button>
          <button
            onClick={updateUserDetails}
            className="px-5 py-3 rounded-[8px] bg-[#750550] text-white font-semibold cursor-pointer transition-[0.15s_ease] hover:bg-[#4a0433]"
          >
            Accept
          </button>
          <div className="absolute top-[-51px] left-[24px] right-[24px] h-[50px] flex-shrink-0 bg-gradient-to-t from-[#fff]/[0.75] to-transparent pointer-events-none"></div>
        </footer>
      </article>
    </div>
  );
};

export default Modal;
