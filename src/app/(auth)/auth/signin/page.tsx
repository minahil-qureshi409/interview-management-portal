// app/auth/signin/page.tsx

"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/actions/userActions';
import { FaGoogle } from 'react-icons/fa';
import { Cube } from 'lucide-react';

export default function SignInPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (isLoginView) {
      const result = await signIn('credentials', { redirect: false, email, password });
      if (result?.error) {
        setError("Invalid email or password.");
        setIsLoading(false);
      } else {
        router.push('/'); // Redirect to root, middleware will handle the rest
      }
    } else {
      const result = await registerUser(formData);
      if (result.success) {
        const signInResult = await signIn('credentials', { redirect: false, email, password });
        if (signInResult?.ok) {
          router.push('/'); // Redirect to root, middleware will handle the rest
        } else {
          setError("Account created, but automatic login failed. Please sign in.");
          setIsLoading(false);
        }
      } else {
        setError(result.message);
        setIsLoading(false);
      }
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/' }); // Redirect to root
  };
  return (
    // Main container - centers the form vertically and horizontally
    <div className="flex h-screen items-center justify-center bg-gray-50 p-5 shadow-lg">
      {/* Form container with max-width and styling */}
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        {/* Header Section */}
        <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {/* <Mail className="h-8 w-8 text-purple-600" /> */}
              {/* <span className="text-xl font-semibold text-gray-700">TheCubeFactory</span> */}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{isLoginView ? 'Welcome back' : 'Create your account'}</h2>
            <p className="mt-1 text-sm text-gray-500">{isLoginView ? 'Please enter your details' : 'It only takes a minute!'}</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <div>
              <label htmlFor="name" className="sr-only">Username</label>
              <input name="name" id="name" type="text" placeholder="Username" required className="w-full rounded-md border-gray-300 py-2 px-3 text-gray-800 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
            </div>
          )}
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input name="email" id="email" type="email" placeholder="Email address" autoComplete="email" required className="w-full rounded-md border-gray-300 py-2 px-3 text-gray-800 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input name="password" id="password" type="password" placeholder="Password" autoComplete="current-password" required className="w-full rounded-md border-gray-300 py-2 px-3 text-gray-800 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
          </div>
          
          {error && <p className="text-sm font-medium text-red-600 text-center">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full flex justify-center rounded-md bg-[#19183B]  px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:bg-purple-300">
            {isLoading ? 'Processing...' : (isLoginView ? 'Sign in' : 'Create account')}
          </button>
        </form>

        {/* "Or" Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
          <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">OR</span></div>
        </div>

        {/* Google Sign In Button */}
        <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex justify-center items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:bg-gray-100">
          <FaGoogle className="h-4 w-4" />
          Sign in with Google
        </button>

        {/* Toggle between Sign In / Sign Up */}
        <p className="text-center text-sm text-gray-500">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="ml-1 font-semibold leading-6 text-[#19183B] hover:text-[#19183B] ">
            {isLoginView ? 'Sign up' : 'Sign in'}
          </button>
        </p>

      </div>
    </div>
  );
}