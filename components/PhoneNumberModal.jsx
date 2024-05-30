"use client";
import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FaTimes } from "react-icons/fa";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const PhoneNumberModal = ({ isOpen, onClose, onVerify }) => {
  const { data: session } = useSession();
  const [phone, setPhone] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsButtonDisabled(phone.trim() === "");
  }, [phone]);

  if (!isOpen) return null;

  const handleVerifyClick = async () => {
    if (!isButtonDisabled) {
      setIsLoading(true);
      setMessage("");

      try {
        const response = await fetch("/api/backend/ph-verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: session.user.email,
            phoneNumber: `+${phone}`, // Ensure the phone number has the `+` sign
          }),
        });

        const data = await response.json();
        console.log(data, "its api data...");
        if (response.status === 200) {
          toast.success("OTP sent successfully!");
          onClose();
          onVerify(`+${phone}`); // Pass the phone number to the onVerify callback
        } else {
          toast.error(data.message || "Failed to send OTP");
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
        toast.error("Error sending OTP");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg sm:w-[350px] md:w-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Enter your phone number</h2>
            <button onClick={onClose}>
              <FaTimes className="text-red-600" />
            </button>
          </div>
          <PhoneInput
            country={"us"}
            value={phone}
            onChange={(phone) => setPhone(phone)}
            containerStyle={{ marginBottom: "1rem" }}
            inputStyle={{ width: "100%" }}
          />
          <div className="flex justify-between">
            <button
              className="text-white bg-black rounded-[5px] px-[6px] hover:bg-zinc-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded ${
                isButtonDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#3F51B5] text-white hover:bg-blue-700"
              }`}
              onClick={handleVerifyClick}
              disabled={isButtonDisabled || isLoading}
            >
              {isLoading ? "Sending..." : "Verify"}
            </button>
          </div>
          {message && <p>{message}</p>}
        </div>
      </div>
    </>
  );
};

export default PhoneNumberModal;
