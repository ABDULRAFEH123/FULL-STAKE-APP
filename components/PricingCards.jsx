"use client";
import { FaBicycle, FaCar, FaPlane, FaRocket, FaCheck } from "react-icons/fa";
import { useState, useEffect } from "react";
const PricingCards = () => {
  
  const plans = [
    {
      name: "Basic",
      price: "$50/daily",
      features: ["Unlimited Downloads", "Email Support", "Limited Access","Just For 10 Days"],
      icon: <FaBicycle size={90} className="text-blue-500" />,
      featureIcon: <FaCheck className="text-blue-500" />,
      buttonColor: "bg-blue-500 hover:bg-blue-700",
    },
    {
      name: "Standerd",
      price: "100$/daily",
      features: [
        "Everything in Free, plus",
        "Up to 10 Users",
        "Email and Call Support",
        "1 Year Access",
      ],
      icon: <FaCar size={90} className="text-red-500" />,
      featureIcon: <FaCheck className="text-red-500" />,
      buttonColor: "bg-red-500 hover:bg-red-700",
    },
    {
      name: "Premium",
      price: "200$/daily",
      features: [
        "Everything in Pro, plus",
        "Unlimited Access",
        "On-demand Request",
        "Lifetime Access",
      ],
      icon: <FaPlane size={90} className="text-green-500" />,
      featureIcon: <FaCheck className="text-green-500" />,
      buttonColor: "bg-green-500 hover:bg-green-700",
    },
    {
      name: "Legendary",
      price: "500$/weekly",
      features: [
        "All Features",
        "Private Support",
        "Dedicated Manager",
        "Priority On-demand Requests",
      ],
      icon: <FaRocket size={90} className="text-purple-500" />,
      featureIcon: <FaCheck className="text-purple-500" />,
      buttonColor: "bg-purple-500 hover:bg-purple-700",
    },
  ];






  return (
    <div className="container mx-auto px-[13rem] py-8">
      <div className="grid grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="custom_card_shadow p-6 bg-white rounded-lg flex flex-col items-center text-center space-y-4"
          >
            <div className="text-xl font-bold text-gray-800">{plan.name}</div>
            <div className="text-lg font-semibold text-gray-600">
              {plan.price}
            </div>
            {plan.icon}
            <ul className="flex flex-col space-y-2">
              {plan.features.map((feature, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-center gap-2"
                >
                  {plan.featureIcon}
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`${plan.buttonColor} text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-opacity-50`}
            >
            Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingCards;
