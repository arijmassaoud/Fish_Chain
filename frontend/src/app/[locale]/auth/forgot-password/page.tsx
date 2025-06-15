'use client';

import React, { useState, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, LoaderCircle, CheckCircle, ShieldAlert, KeyRound } from 'lucide-react';

// --- Composants UI (Réutilisés depuis les autres pages d'authentification) ---
const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200/80 ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`p-8 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }: { children: ReactNode; className?: string }) => <h2 className={`text-3xl font-bold text-slate-800 ${className}`}>{children}</h2>;
const CardContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`p-8 pt-0 ${className}`}>{children}</div>;

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Votre logique backend reste inchangée
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Veuillez saisir votre adresse e-mail.");
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Échec de l\'envoi du lien de réinitialisation.');
            }

            setMessage('Lien de réinitialisation envoyé. Veuillez consulter votre boîte de réception.');
            toast.success('Lien envoyé avec succès !');

        } catch (err: any) {
            const errorMessage = err.message || 'Une erreur est survenue. Veuillez réessayer.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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
                {/* Côté Gauche - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-purple-800 to-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{backgroundImage: "url('/images/bg.png')"}}></div>
                    <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 animate-fadeInUp">
                        <div className="mb-8 animate-float">
                           <KeyRound className="w-20 h-20 text-white/80" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4 text-center">Mot de passe oublié ?</h1>
                        <p className="text-lg text-center text-white/80">Pas de soucis. Nous vous aiderons à retrouver l'accès à votre compte.</p>
                    </div>
                </div>

                {/* Côté Droit - Formulaire */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-slate-50">
                    <div className="w-full max-w-md animate-scale-in">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle>Réinitialiser le mot de passe</CardTitle>
                                <p className="text-slate-600 mt-2">Saisissez votre e-mail pour recevoir un lien de réinitialisation.</p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {message ? (
                                        <div className="bg-green-50 border-l-4 border-green-400 text-green-800 p-4 rounded-md flex items-start space-x-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                            <div>
                                                <p className="font-bold">Succès</p>
                                                <p>{message}</p>
                                            </div>
                                        </div>
                                    ) : error ? (
                                        <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-md flex items-start space-x-3">
                                            <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5" />
                                            <div>
                                                <p className="font-bold">Erreur</p>
                                                <p>{error}</p>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-slate-700 font-medium">Adresse e-mail</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="votre.email@exemple.com"
                                                autoComplete="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={loading || !!message} // Désactivé si envoi en cours ou si succès
                                                className="pl-12 w-full h-12 border-2 bg-slate-100/50 border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !!message}
                                        className="w-full flex justify-center items-center h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <LoaderCircle className="animate-spin" /> : 'Envoyer le lien'}
                                    </button>

                                    <div className="text-center pt-4">
                                        <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                                            Retour à la connexion
                                        </Link>
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