'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeaseRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main leases page
    router.replace('/dashboard/leases');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Redirecting...</h1>
        <p className="text-gray-600">Taking you to the leases page...</p>
      </div>
    </div>
  );
}
