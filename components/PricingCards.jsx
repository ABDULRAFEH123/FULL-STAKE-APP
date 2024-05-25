"use client";
import { update } from "next-auth/react";
import { useState, useEffect } from "react";
import { FaBicycle, FaCar, FaPlane, FaRocket, FaCheck } from "react-icons/fa";
import { useSession } from "next-auth/react";
import CancellationModal from './CancellationModal';
const PricingCards = () => {
  const { data: session, update } = useSession();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [subscribedPlan, setSubscribedPlan] = useState(null);
  // THIS STATE IS JUST FOR BTN OF SUBSCIBE TO SHOW OR UNSUBSBE BTN TO SHOW OK
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);
  const plans = [
    {
      name: "Basic",
      price: "$1000/Monthly",
      priceId: "price_1PJ8ZG00tPtLCvCGy3nKeysD",
      features: [
        "Unlimited Downloads",
        "Email Support",
        "Limited Access",
        "Just For 10 Days",
      ],
      icon: <FaBicycle size={90} className="text-blue-500" />,
      featureIcon: <FaCheck className="text-blue-500" />,
      buttonColor: "bg-blue-500 hover:bg-blue-700",
      unsubscribeButtonColor: "bg-gray-500 hover:bg-gray-700",
    },
    {
      name: "Standard",
      price: "$100/daily",
      priceId: "price_1PITJj00tPtLCvCGfUg3qvQF",
      features: [
        "Everything in Free, plus",
        "Up to 10 Users",
        "Email and Call Support",
        "1 Year Access",
      ],
      icon: <FaCar size={90} className="text-red-500" />,
      featureIcon: <FaCheck className="text-red-500" />,
      buttonColor: "bg-red-500 hover:bg-red-700",
      unsubscribeButtonColor: "bg-gray-500 hover:bg-gray-700",
    },
    {
      name: "Premium",
      price: "$200/daily",
      priceId: "price_1PITLz00tPtLCvCGZrAjV1lU",
      features: [
        "Everything in Pro, plus",
        "Unlimited Access",
        "On-demand Request",
        "Lifetime Access",
      ],
      icon: <FaPlane size={90} className="text-green-500" />,
      featureIcon: <FaCheck className="text-green-500" />,
      buttonColor: "bg-green-500 hover:bg-green-700",
      unsubscribeButtonColor: "bg-gray-500 hover:bg-gray-700",
    },
    {
      name: "Legendary",
      price: "$500/weekly",
      priceId: "price_1PITMr00tPtLCvCGnsMvx4cu",
      features: [
        "All Features",
        "Private Support",
        "Dedicated Manager",
        "Priority On-demand Requests",
      ],
      icon: <FaRocket size={90} className="text-purple-500" />,
      featureIcon: <FaCheck className="text-purple-500" />,
      buttonColor: "bg-purple-500 hover:bg-purple-700",
      unsubscribeButtonColor: "bg-gray-500 hover:bg-gray-700",
    },
  ];

  // Initialize state from local storage on first render
  useEffect(() => {
    const storedSubscription = localStorage.getItem("subscription");
    if (storedSubscription) {
      const subscriptionData = JSON.parse(storedSubscription);
      setSubscribedPlan(subscriptionData);
      setShowUnsubscribe(subscriptionData.active);
    }
  }, []);

  // Fetch subscription when session changes
  useEffect(() => {
    if (session) {
      fetchSubscription(session.user.email);
    }
  }, [session]);

  const fetchSubscription = async (email) => {
    try {
      const response = await fetch("/api/get-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok && data.subscription) {
        // Update state and local storage with new subscription data
        setSubscribedPlan(data.subscription);
        setShowUnsubscribe(data.subscription.active);
        localStorage.setItem("subscription", JSON.stringify(data.subscription));

        // Update NextAuth session
        updateSession(data.subscription.active);
      } else {
        // Only reset state and local storage if there's no valid subscription
        setSubscribedPlan(null);
        setShowUnsubscribe(false);
        localStorage.removeItem("subscription");

        // Update NextAuth session
        updateSession(false);
      }
    } catch (error) {
      console.error("Error fetching subscription", error);
    }
  };

  const updateSession = async (isActive) => {
    console.log("Updating session with:", isActive ? "active" : "inactive");
    if (
      session &&
      session.user.subscription !== (isActive ? "active" : "inactive")
    ) {
      try {
        await update({
          ...session,
          user: {
            ...session.user,
            subscription: isActive ? "active" : "inactive",
          },
        });
        console.log("Session updated successfully");
      } catch (error) {
        console.error("Error updating session", error);
      }
    }
    console.log(session, "Updated session...");
  };

  const handleSubscribe = async (priceId) => {
    if (!session) return;

    setLoadingPlan(priceId);
    try {
      const response = await fetch("/api/payment-subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          priceId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        window.location.href = data.url; // Redirect to Stripe checkout
        setSubscribedPlan(priceId); // Update local state upon successful subscription
        setShowUnsubscribe(true); // Show Unsubscribe after subscription
      } else {
        console.error("Failed to subscribe", data.error);
      }
    } catch (error) {
      console.error("Subscription error", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleUnsubscribe = async () => {
    if (!session || !subscribedPlan ||loadingPlan) return;

    try {
      setLoadingPlan(true);
      const response = await fetch("/api/payment-unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscribedPlan.subscriptionId,
          email: session.user.email,
        }),
      });

      const data = await response.json();
      console.log(data, "its data .. of unsub..");
      if (response.ok) {
        setSubscribedPlan(null);
        setShowUnsubscribe(false);
      } else {
        console.error("Failed to unsubscribe", data.error);
      }
    } catch (error) {
      console.error("Unsubscribe error", error);
    } finally {
      setLoadingPlan(false);
      setShowModal(false);
    }
  };

  const handleCancelSubscription = () => {
    setShowModal(false);
  };

  return (
    <div className="container mx-auto md:px-[13rem] py-8">
      <div className="grid grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="custom_card_shadow p-6 bg-white rounded-lg flex flex-col items-center text-center space-y-4"
          >
            {/* Display plan information */}
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

            {/* Render subscription/unsubscription buttons */}
            {subscribedPlan &&
            subscribedPlan.active &&
            subscribedPlan.planId === plan.priceId ? (
              // Render Unsubscribe button if this plan is active
              <button
              onClick={() => setShowModal(true)}
              disabled={loadingPlan}
              className={`${plan.unsubscribeButtonColor} text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-opacity-50`}
            >
             {loadingPlan? "Processing...":"UnSubscribe"}
            </button>
      
            ) : (
              // Render Subscribe button if this plan is not active
              <button
                onClick={() => {
                  handleSubscribe(plan.priceId);
                  setSubscribedPlan({ active: true, planId: plan.priceId });
                }}
                className={`${plan.buttonColor} text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-opacity-50`}
                disabled={
                  loadingPlan === plan.priceId ||
                  (subscribedPlan && subscribedPlan.active)
                }
              >
                {loadingPlan === plan.priceId ? "Processing..." : "Subscribe"}
              </button>
            )}
          </div>
        ))}
      </div>
        {/* Cancellation modal */}
        <CancellationModal
        loadingPlan={loadingPlan}
        isOpen={showModal}
        onCancel={handleCancelSubscription}
        onConfirm={handleUnsubscribe}
      />
    </div>
  );
};

export default PricingCards;
