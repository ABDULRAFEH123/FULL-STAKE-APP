"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ImSpinner8 } from "react-icons/im";
export const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [resetLoader, setResetLoader] = useState(false);
  const router = useRouter();
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token"); // Retrieve the token from localStorage
    console.log(token, "get the token from otp page...");
    if (!token) {
      console.log("Session expired or invalid. Please verify your OTP again.");
      return;
    }

    try {
        setResetLoader(true);
      const response = await fetch("/api/reset-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: token, // Pass the token in the request header
        },

        body: JSON.stringify({
          password,
        }),
      });
      if (response.ok) {
        
        toast.success("Password reset successfully")
        setResetLoader(false);
        console.log("Password reset successfully");
        localStorage.removeItem("token"); // Optionally clear the token after use
        router.push("/login"); // Redirect the user or update the UI state
      } else {
        console.log("else");
        const data = await response.json();
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (error) {
        setResetLoader(false);
      console.log(error);
      //   console.log(`Error: ${error.message}`);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
          <h2 className="flex justify-center mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Change Password
          </h2>
          <form
            className="mt-4 space-y-4 lg:mt-5 md:space-y-5"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="confirm-password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                type="password"
                name="confirm-password"
                id="confirm-password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required=""
                value={password}
                onChange={handlePasswordChange}
              />
            </div>

            <button
              type="submit"
              disabled={resetLoader}
              className="w-full text-white bg-purple-600 
              hover:bg-primary-700 focus:ring-4 focus:outline-none 
             focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600
             dark:hover:bg-purple-700 dark:focus:ring-primary-800"
            >
               {resetLoader ? (
                  <ImSpinner8 className="spinning_icon" />
                ) : (
                  "Reset Password"
                )}
             
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
