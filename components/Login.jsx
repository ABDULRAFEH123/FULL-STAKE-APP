"use client";

import Image from "next/image";
import React, { useState } from "react";
import logo from "../public/logo.png";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import { ImSpinner8 } from "react-icons/im";

export default function Login() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loginLoader,setLoginLoader]=useState(false);
  const { data: session } = useSession(); 

  // console.log(userId,"its///")

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoginLoader(true);
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (response.error) {
        setLoginLoader(false);
        setError("Invalid Credentials");
        return;
      }
      setLoginLoader(false);
      router.replace("/home");
    } catch (error) {
      setLoginLoader(false);
      console.log(error)
    }
  };
  return (
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
          Login To Your Account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form  onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
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
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-between">
              <div className="">
                {error && <h4 className="text-red-600  ">{error}</h4>}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex justify-center w-full rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                  {loginLoader ? (
                  <ImSpinner8 className="spinning_icon" />
                ) : (
                  "Login"
                )}
             
            </button>
          </div>
        </form>
        <div className="text-sm flex justify-between">
          <Link
          href={'/verifyemail'}
            className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
          >
            Forgot password?
          </Link>
          
          <Link href={"/signup"}
            className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none">
             Signup
          </Link>
        </div>
      </div>
    </div>
  );
}
