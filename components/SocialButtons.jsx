"use client";
import { signIn } from "next-auth/react";
import React from "react";
import { FaLinkedinIn, FaFacebook, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const socialMediaPlatforms = [
  {
    icon: <FaLinkedinIn className="text-[#0077B5]" />,
    name: "LinkedIn",
    handleClick: () => signIn("linkedin"),
    color: "text-[#0077B5]",
  },
  {
    icon: <FaGithub className="text-black" />,
    name: "GitHub",
    handleClick: () => signIn("github"),
    color: "text-[#0077B5]",
  },
  {
    icon: <FcGoogle />,
    name: "Google",
    handleClick: () => signIn("google"),
    color: "text-[#0077B5]",
  },
  {
    icon: <FaFacebook className="text-[#4267B2]" />,
    name: "Facebook",
    handleClick: () => signIn("facebook"),
    color: "text-[#0077B5]",
  },
];

export default function SocialButtons() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center mt-[0px]">
            {socialMediaPlatforms.map((platform, index) => (
                <div key={index} className="w-full">
                    <button 
                        onClick={platform.handleClick} 
                        className={`w-full flex items-center border-2 border-blue-500 mx-auto px-2 py-1 rounded-xl`}>
                        <span className={`ml-1 ${platform.color}`}>{platform.icon}</span>
                        <p className={`mx-auto font-semibold ${platform.color}`}>
                            Login with {platform.name}
                        </p>
                    </button>
                </div>
            ))}
        </div>
    );
}
