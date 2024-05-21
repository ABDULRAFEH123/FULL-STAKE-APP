"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ImSpinner8 } from "react-icons/im";
import toast from "react-hot-toast";
export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [emailLoader, setEmailLoader] = useState(false);
  const [error, setError] = useState("")
  const router = useRouter();
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    // console.log("Email input updated:", event.target.value); // Debugging
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if(!email){
      setError("Please fill that field")
      return;
    }
    try {
      setEmailLoader(true);
      const res = await fetch("/api/verifyemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });
      const data = await res.json();
      setEmailLoader(false);
      if (res.ok) {
        toast.success("Verification Done Successfully")
        router.push("/verifyotp");
      } else {
        setEmailLoader(false);
        setError(data.message);
        console.error("Error details:", data); // Use 'data' directly if 'response.json()' has already parsed it
      }
    } catch (error) {
      console.error("Error in sending email:", error); // Debugging
    }
  };

  return (
    <>
      <section class="bg-gray-50 dark:bg-gray-900">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div class="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
            <h2 class="mb-4 text-xl font-bold leading-tight tracking-tight flex justify-center text-gray-900 md:text-2xl dark:text-white">
              Email Verification
            </h2>
            <form onSubmit={handleVerifyEmail}>
              <div className="pb-3">
                <input
                  type="email"
                  name="email"
                  id="email"
                  class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@gmail.com"
                  required=""
                  onChange={handleEmailChange}
                />
                {error && (
                  <div className="flex justify-between">
                    <h4 className="text-red-600  ">{error}</h4>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={emailLoader}
                className="w-full flex justify-center text-white bg-purple-500 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                {emailLoader ? (
                  <ImSpinner8 className="spinning_icon" />
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
