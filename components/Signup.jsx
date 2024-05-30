"use client";

import Image from "next/image";
import React from "react";
import logo from "../public/logo.png";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImSpinner8 } from "react-icons/im";
import  toast from "react-hot-toast";
export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signupLoader,setSignupLoader]=useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("All fields are necessary.");
      return;
    }
    // API to ensure that a user with the same email does not exist
    try {
      setSignupLoader(true)
      const response = await fetch("/api/backend/userexist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setSignupLoader(false)
       // Ensures that the response is fully received and parsed
      if (data.userExists) {
        setError("USER ALREADY EXISTS.");
        return;
      }
      setSignupLoader(true);

      // Proceed with signup if user does not exist
      const res = await fetch("/api/backend/signup", {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (res.ok) {
        toast.success("User Register Successfully")
        setSignupLoader(false);
        const form = e.target;
       
        form.reset(); // Reset form on successful registration
        router.push("/login");
      } else {
        console.log("User registration failed.");
      }
    } catch (error) {
      console.log("Error during registration: ", error);
      setError("An error occurred during registration.");
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image
            className="mx-auto w-auto"
            src={logo}
            width={110}
            height={110}
            alt="Your Company"
          />
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Register Your Account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="mt-1">
                <input
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              {error && (
                <div className="flex justify-between">
                  <h4 className="text-red-600  ">{error}</h4>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={signupLoader}
                className="flex justify-center w-full rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                 {signupLoader ? (
                  <ImSpinner8 className="spinning_icon" />
                ) : (
                  "Register"
                )}
             
              </button>
            </div>
          </form>
          <div className="text-sm">
            <Link
              href={"/login"}
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              Already Have an Account ? 
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
