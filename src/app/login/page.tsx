'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Button from '@mui/material/Button';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/chat');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to AI Chat</h1>
          <p className="mb-8">Please sign in to continue</p>
          <Button variant="contained" onClick={() => signIn('google')}>
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
