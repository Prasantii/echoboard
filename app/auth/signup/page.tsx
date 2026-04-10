'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const supabase = createClient();
    const router = useRouter();

    const handleSignUp = async (e: React.ChangeEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // This redirect is used for email confirmation links
                emailRedirectTo: `${window.location.origin}/auth`,
            },
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else if (data.user && data.session === null) {
            // By default, Supabase requires email confirmation
            setMessage("Check your email to confirm your account!");
        } else {
            router.push('/dashboard');
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="flex h-full w-full items-center justify-center bg-slate-50">
            <Card className="w-100">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating..." : "Sign Up"}
                        </Button>
                        {message && <p className="text-sm text-center mt-2 text-blue-600">{message}</p>}
                    </form>
                    <p className="mt-4 text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <a href="/auth" className="text-primary hover:underline">Sign In</a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}