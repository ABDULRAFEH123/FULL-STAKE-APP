"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LogRocket from 'logrocket';

// Ensure LogRocket is initialized on the client-side
if (typeof window !== 'undefined') {
  LogRocket.init('ys1zro/demo');
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    // Identify the user with LogRocket if the session is available
    if (status === 'authenticated' && session) {
      LogRocket.identify(session.user.id, {
        name: session.user.name,
        email: session.user.email,
        // You can add more user-specific properties here
      });
    }
  }, [session, status]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">HI THERE WELCOME !!</h1>
    </main>
  );
}
