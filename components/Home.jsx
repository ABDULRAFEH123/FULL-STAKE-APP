"use client";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import UpdateProfile from "./UpdateProfile";
import PricingCards from "./PricingCards";
import { FaExclamationTriangle } from "react-icons/fa";
import PhoneVerification from "./PhoneVerification";

export default function Home() {
  const { data: session } = useSession();
  // console.log(session, "homepage session.");

  const handleSignOut = async () => {
    // Clear local storage before signing out
    localStorage.removeItem("session");

    // Then sign out and redirect
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  };

  useEffect(() => {
    if (session && session.user) {
      // console.log("Session Data:", session); // Debug: Check what's in the session
      // Store session information in local storage (not recommended for AccessToken)
      localStorage.setItem(
        "session",
        JSON.stringify({
          userId: session.user.id,
          userEmail: session.user.email,
          accessToken: session.user.accessToken, // Check naming consistency; JavaScript is case-sensitive
        })
      );
    }
  }, [session]);

  return (
    <>
      <div className="flex justify-between items-center bg-gray-800 text-white p-4">
        <div className="flex justify-between">
          <div className="text-lg font-bold">
            <UpdateProfile />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className="font-semibold">Name:</span> {session?.user?.name}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {session?.user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-500 px-6 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
      {/* *************************PH VERIFICATION **************************** */}
      <PhoneVerification />
      {/* ************************* STRIPE SUBSCRIPTION CARDS ****************** */}
      <PricingCards />
    </>
  );
}
