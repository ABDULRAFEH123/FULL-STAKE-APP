"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") {
      // Wait for the session to be loaded
      return;
    }

    if (status === "authenticated") {
      // Redirect if user is authenticated
      console.log(session, "User session");
      router.push("/home");
    } else {
      // Redirect to login if user is not authenticated
      router.push("/login");
    }
  }, [status, session, router]);

  // Render nothing while waiting for session to load
  if (status === "loading") {
    return null;
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">HI THERE WELCOME !!</h1>
    </main>
  );
}
