"use client";
import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import PhoneNumberModal from "./PhoneNumberModal";
import OtpVerificationModal from "./OtpVerificationModal";
const PhoneVerification = () => {
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const handlePhoneVerify = (phone) => {
    setPhoneNumber(phone);
    setIsOtpModalOpen(true);
  };
  return (
    <>
      <div className="bg-[#ed0000] text-white flex items-center justify-center py-[10px]">
        <FaExclamationTriangle className="mr-2 text-yellow-300" size={24} />
        <span className="mr-2">
          Please Verify Your Phone Number For Future Subscriptions
        </span>
        <button
          className="text-black hover:underline"
          onClick={() => setIsPhoneModalOpen(true)}
        >
          Click Here
        </button>
     
      </div>
      <PhoneNumberModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onVerify={handlePhoneVerify}
      />
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        phoneNumber={phoneNumber}

      />
    </>
  );
};

export default PhoneVerification;
