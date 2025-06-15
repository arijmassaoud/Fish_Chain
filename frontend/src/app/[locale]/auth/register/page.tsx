'use client';

import React, { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { User, Mail, Lock, Eye, EyeOff, LoaderCircle, Briefcase, FileText } from 'lucide-react';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

// --- UI Components (You can reuse these from your login page) ---
const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200/80 ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`p-8 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }: { children: ReactNode; className?: string }) => <h2 className={`text-3xl font-bold text-slate-800 ${className}`}>{children}</h2>;
const CardContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`p-8 pt-0 ${className}`}>{children}</div>;


// --- The core logic of the registration page ---
const RegisterPageContent = () => {
    const router = useRouter();
    const { register, googleLogin } = useAuth(); // `googleLogin` can also handle registration
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('BUYER');
    const [agreedToTerms, setAgreedToTerms] = useState(false); // NEW STATE
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password) {
            toast.error('Please fill in all fields.');
            return;
        }

        if (!agreedToTerms) {
            toast.error("Please accept the terms of use.");
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch(`${API}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role })
            });

            // If the response is not OK, read text instead of parsing JSON
            if (!response.ok) {
                const text = await response.text(); // Read HTML/text
                throw new Error(`Registration failed. Server responded with status ${response.status}.`);
            }

            const data = await response.json(); // Now safe to parse

            if (data.success) {
                toast.success('Account created successfully!');
                router.push('/auth/signin');
            } else {
                throw new Error(data.message || "Registration failed");
            }
        } catch (err: any) {
            const message = err.message || "An error occurred";
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (tokenResponse: any) => {
        try {
            await googleLogin(tokenResponse.access_token);
            toast.success('Google login successful!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Google login failed.');
        }
    };

    const startGoogleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => toast.error('Google login failed.'),
    });

    return (
        <>
            <style jsx global>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-scale-in { animation: scaleIn 0.5s ease-out forwards; }
            `}</style>
            <div className="min-h-screen flex font-sans">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-purple-800 to-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{backgroundImage: "url('/images/bg.png')"}}></div>
                    <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 animate-fadeInUp">
                    
                        <h1 className="text-4xl font-bold mb-4 text-center">Join our community</h1>
                        <p className="text-lg text-center mb-8 text-white/80">Create your account and access the best of <span className="font-semibold">FishChain</span></p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-slate-50">
                    <div className="w-full max-w-md animate-scale-in">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle>Create an account</CardTitle>
                                <p className="text-slate-600 mt-2">It's quick and easy.</p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (<div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md" role="alert"><p className="font-bold">Error</p><p>{error}</p></div>)}

                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-slate-700 font-medium">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
                                            <input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} className="pl-12 w-full h-12 border-2 bg-slate-100/50 border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-slate-700 font-medium">E-mail</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
                                            <input id="email" type="email" placeholder="your.email@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} className="pl-12 w-full h-12 border-2 bg-slate-100/50 border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="password" className="text-slate-700 font-medium">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
                                            <input id="password" type={showPassword ? "text" : "password"} placeholder="8+ characters" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} className="pl-12 pr-12 w-full h-12 border-2 bg-slate-100/50 border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg transition-all" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="role" className="text-slate-700 font-medium">I am a</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
                                            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} disabled={isSubmitting} className="pl-12 w-full h-12 border-2 bg-slate-100/50 border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg transition-all appearance-none">
                                                <option value="BUYER">Buyer</option>
                                                <option value="SELLER">Seller</option>
                                                <option value="VET">Veterinarian</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* NEW BLOCK: Terms of Use */}
                                    <div className="flex items-start space-x-3 pt-2">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            checked={agreedToTerms}
                                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            className="h-4 w-4 mt-1 accent-blue-600 text-white border-slate-300 rounded focus:ring-blue-500"
                                        />
                                        <div className="text-sm leading-6">
                                            <label htmlFor="terms" className="font-medium text-slate-700">
                                                I have read and agree to the{' '}
                                                <Link href="/terms" target="_blank" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                                    Terms of Use
                                                </Link>
                                            </label>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-70">
                                        {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Create My Account'}
                                    </button>

                                    <div className="relative pt-2">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300" /></div>
                                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or sign up with</span></div>
                                    </div>

                                    <button type="button" onClick={() => startGoogleLogin()} className="w-full flex items-center justify-center space-x-2 h-12 border-2 border-slate-200 bg-white hover:bg-slate-50 rounded-lg">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                        <span className="font-semibold text-slate-700">Google</span>
                                    </button>

                                    <div className="text-center pt-4">
                                        <p className="text-slate-600">Already have an account?{' '}<Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 font-semibold">Log In</Link></p>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};


// --- The final component that wraps the page with the Google Provider ---
export default function RegisterPage() {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
        return <div className="flex items-center justify-center min-h-screen">Configuration Error: Google Client ID missing.</div>;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <RegisterPageContent />
        </GoogleOAuthProvider>
    );
}