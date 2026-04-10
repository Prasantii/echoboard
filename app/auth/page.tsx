'use client';
import { redirect } from "next/navigation";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient(); // Initialize client

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Call Supabase native login function
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      // Login successful! Supabase automatically sets an HTTP-only cookie.
      router.push('/dashboard'); // Redirect to main app
      router.refresh(); // Important: Refresh server data
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome Back to EchoBoard</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</div>}
            <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <a href="/auth/signup" className="text-primary hover:underline">Sign up</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function Index() {

  async function handleLogin(formData: FormData) {
    // "use server"
    redirect('/dashboard');
  }

  return (
    <div className="grow flex container m-auto items-center justify-center bg-gray-50">
      <div className="w-full sm:max-w-md flex flex-col px-6 py-4 m-8 gap-8 bg-white rounded-lg border border-gray-300">
        <h1 className="font-medium text-xl text-center text-primary">ECHOBOARD</h1>

        <form action={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium">E-mail<span className="text-destructive">*</span></label>
            <input name="email" placeholder="Enter your e-mail" type="email" required />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Password<span className="text-destructive">*</span></label>
            <input name="email" placeholder="Enter your password" type="password" required />
          </div>

          <Button type="submit">Login</Button>

        </form>

      </div>


    </div>
  );
}