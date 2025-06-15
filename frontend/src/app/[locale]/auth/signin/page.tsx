'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/GooglelginButton';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, Lock, LoaderCircle } from 'lucide-react'; // Removed Eye/EyeOff as they're not used here
import { useAuth } from '@/contexts/AuthContext';

// UI Components (Corrected: Added types for 'children' and 'className' props)
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200/80 ${className}`}>
        {children}
    </div>
);
const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`p-8 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <h2 className={`text-3xl font-bold text-slate-800 ${className}`}>{children}</h2>;
const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`p-8 pt-0 ${className}`}>{children}</div>;

export default function LoginPage() {
    const router = useRouter();
    // Corrected: Ensure `login` exists in your AuthContext.
    const { login } = useAuth();

    // States for your existing logic
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for new design (Note: showPassword isn't used in this translated file for visibility toggle)
    const [showPassword, setShowPassword] = useState(false); // Declared but not directly used for the password input type toggle in this specific component

    // Corrected: Added type for event 'e'
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!email || !password) {
            const msg = 'Please enter your email and password.';
            setError(msg);
            toast.error(msg);
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            await login(email, password);
            toast.success('Login successful! Redirecting...');
            router.push('/dashboard'); // Redirect to dashboard or other page
        } catch (err) {
            // Corrected: Proper handling of 'unknown' error type
            let message = 'Invalid email or password.';
            if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Logic for Google login (handled by GoogleLoginButton component)

    return (
        <>
            {/* Custom animations definitions */}
            <style jsx global>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-scale-in { animation: scaleIn 0.5s ease-out forwards; }
            `}</style>

            <div className="min-h-screen flex font-sans">
                {/* Left Side - Welcome Section */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-purple-800 to-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{backgroundImage: "url('/images/bg.png')"}}></div>
                    <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 animate-fadeInUp">
                        <div className="mb-8 animate-float">
                            {/* Using next/image for the logo */}
                            <Image src="/logo.png" alt="FishChain Logo" width={80} height={80} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4 text-center">
                            Welcome Back!
                        </h1>
                        <p className="text-lg text-center mb-8 text-white/80">
                            Log in to your <span className="font-semibold">FishChain</span> account
                        </p>
                        <div className="text-center mt-8 border-t border-white/20 pt-8 w-full">
                            <p className="text-white/60 mb-4">Join over 10,000 professionals</p>
                            <div className="flex justify-center space-x-8 text-white/80">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">98%</div>
                                    <div className="text-sm">Satisfaction</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">24/7</div>
                                    <div className="text-sm">Support</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">+30%</div>
                                    <div className="text-sm">Efficiency</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-slate-50">
                    <div className="w-full max-w-md animate-scale-in">
                        <Card>
                            <CardHeader className="text-center">
                                <div className="lg:hidden mb-4">
                                    <Image src="/logo.png" alt="FishChain Logo" width={60} height={60} className="mx-auto" />
                                </div>
                                <CardTitle>Login</CardTitle>
                                <p className="text-slate-600 mt-2">
                                    Access your account to continue
                                </p>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Error message integration */}
                                    {error && (
                                        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md" role="alert">
                                            <p className="font-bold">Error</p>
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-slate-700 font-medium">E-mail</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="your.email@example.com"
                                                autoComplete="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isSubmitting}
                                                className="pl-12 w-full h-12 border-2 bg-slate-100/50 border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="password" className="text-slate-700 font-medium">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"} // showPassword state is present but no toggle button is included in this component.
                                                placeholder="Your password"
                                                autoComplete="current-password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isSubmitting}
                                                className="pl-12 pr-12 w-full h-12 border-2 bg-slate-100/50 border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg transition-all duration-300"
                                            />
                                            {/* Note: The Eye/EyeOff toggle button is not present in this component's JSX */}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end">
                                        {/* Using next/link for forgot password */}
                                        <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex justify-center items-center h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Log In'}
                                    </button>

                                    <div className="relative pt-2">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300" /></div>
                                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-50 text-slate-500">Or log in with</span></div>
                                    </div>

                                    <GoogleLoginButton/>

                                    <div className="text-center pt-4">
                                        <p className="text-slate-600">
                                            Don&apos;t have an account?{' '}
                                            <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                                                Sign Up
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}