"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";

const OtpVerificationModal = ({ isOpen, onClose,phoneNumber }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "") {
      if (e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleVerifyClick = async () => {
    console.log("clicke...")
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/backend/verifyotp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: otp.join(""),
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
      toast.success("OTP verified successfully!");
        // Handle successful OTP verification, such as redirecting or updating state
        onClose();
      } else {
        toast.error(data.message || "Failed to verify OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage("Error verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const allInputsFilled = otp.every((value) => value !== "");
    const verifyButton = document.querySelector(".verify-btn");
    if (verifyButton) {
      verifyButton.disabled = !allInputsFilled;
      if (allInputsFilled) {
        verifyButton.classList.add("active");
      } else {
        verifyButton.classList.remove("active");
      }
    }
  }, [otp]);

  if (!isOpen) return null; // Ensure that hooks are not conditionally rendered


  const maskedPhoneNumber = phoneNumber
    ? `${phoneNumber.slice(0, 5)}*****`
    : "";
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">OTP Verification</h2>
          <button onClick={onClose}>
            <FaTimes className="text-red-600" />
          </button>
        </div>
        <div className="icon flex justify-center items-center mb-4">
          <div className="bg-yellow-500 text-white rounded-full p-3 text-2xl">
            <ion-icon name="shield-checkmark"></ion-icon>
          </div>
        </div>
        <p className="text-center text-gray-600 mb-4">
          Enter OTP Code sent to <strong>{maskedPhoneNumber}</strong>
        </p>
        <div className="fields flex justify-between mb-4">
          {otp.map((data, index) => (
            <input
              className="w-10 h-10 text-center border-2 border-gray-300 rounded focus:border-yellow-500"
              type="text"
              name="otp"
              maxLength="1"
              key={index}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>
        <button
          className="verify-btn bg-yellow-500 text-white w-full py-2 rounded disabled:opacity-50"
      disabled={isLoading}
          onClick={handleVerifyClick}
        >
          {isLoading ? "Verifying..." : "Verify & Proceed"}
        </button>
        {message && <p className="text-center mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default OtpVerificationModal;



