"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { ImSpinner8 } from "react-icons/im";

export default function verifyOtp() {
  const inputRef = useRef([]);
  const [inputs, setInputs] = useState(Array(6).fill("")); // Assuming a 6-digit OTP for simplicity
  const [otpLoader, setOtpLoader] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();
  console.log(session, "otp page.session.");

  const handleKeyDown = (e, index) => {
    if (
      !/^[0-9]$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab" &&
      !e.metaKey
    ) {
      e.preventDefault();
    }

    if (e.key === "Backspace" || e.key === "Delete") {
      if (index > 0) {
        const newInputs = [...inputs];
        newInputs[index] = "";
        newInputs[index - 1] = "";
        setInputs(newInputs);
        inputRef.current[index - 1].focus();
      }
    }
  };

  const handleInput = (e, index) => {
    const newInputs = [...inputs];
    newInputs[index] = e.target.value;
    setInputs(newInputs);
    if (index < inputs.length - 1 && e.target.value) {
      inputRef.current[index + 1].focus();
    }
  };

  const handleFocus = (index) => {
    inputRef.current[index].select();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const otpRegex = /^[0-9]+$/;

    if (!otpRegex.test(pasteData)) {
      console.log("Invalid paste data:", pasteData);
      return;
    }

    const newInputs = pasteData.split("").slice(0, inputs.length);
    const updatedInputs = [...inputs];
    newInputs.forEach((char, index) => {
      updatedInputs[index] = char;
    });

    setInputs(updatedInputs);
    inputRef.current[newInputs.length].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isFormValid = inputs.every((value) => value !== ""); // Check if all fields are filled
  
    if (!isFormValid) {
      setError("Please fill all the fields.");
      return;
    }
    const otp = inputs.join("");
    try {
      setOtpLoader(true);
      const response = await fetch("/api/verifyotp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      });
  
      setOtpLoader(false);
  
      if (response.ok) {
        const data = await response.json();
        console.log("OTP verified successfully!");
        toast.success("OTP verified successfully!");
        localStorage.setItem("token", data.token); // Save the token to localStorage
        router.push("/reset-password");
      } else {
        const data = await response.json();
        console.error("Failed to verify OTP:", data.message);
        setError(data.message || "Please enter correct OTP.");
      }
    } catch (error) {
      console.error("An error occurred while verifying the OTP:", error);
      setOtpLoader(false);
      setError("An error occurred while verifying the OTP.");
    }
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-24">
      <div className="flex justify-center">
        <div className="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow">
          <header className="mb-8">
            <h1 className="text-2xl font-bold mb-1">OTP Verification</h1>
            <p className="text-[15px] text-slate-500">
              Enter the 5-digit verification code that was sent to your Email
              Address.
            </p>
          </header>
          <form id="otp-form" onSubmit={handleSubmit}>
            <div className="flex items-center justify-center gap-3">
              {inputs.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  value={value}
                  onChange={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={() => handleFocus(index)}
                  onPaste={handlePaste}
                  maxLength={1}
                  ref={(el) => (inputRef.current[index] = el)}
                />
              ))}
            </div>
            {error && (
              <div className="flex justify-center pt-1">
                <h4 className="text-red-600  ">{error}</h4>
              </div>
            )}
            <div className="max-w-[260px] mx-auto mt-4">
              <button
                type="submit"
                disabled={otpLoader}
                className="w-full flex justify-center text-white bg-purple-500 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                {otpLoader ? (
                  <ImSpinner8 className="spinning_icon" />
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
