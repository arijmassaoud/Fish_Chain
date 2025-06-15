'use client';

import React, { useState, ReactNode, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, LoaderCircle, CheckCircle, ShieldAlert } from 'lucide-react';

// --- Composants UI (Réutilisés depuis les autres pages d'authentification) ---
const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200/80 ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`p-8 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }: { children: ReactNode; className?: string }) => <h2 className={`text-3xl font-bold text-slate-800 ${className}`}>{children}</h2>;
const CardContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`p-8 pt-0 ${className}`}>{children}</div>;


// --- Le composant qui contient la logique et le JSX ---
function ResetPasswordComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Votre logique backend reste inchangée
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!token) {
            setError('Jeton manquant ou invalide. Veuillez utiliser le lien de votre e-mail.');
            toast.error('Jeton de réinitialisation manquant.');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            toast.warning('Le mot de passe est trop court.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            toast.error('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: password, token }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Jeton invalide ou expiré. Veuillez en demander un nouveau.');
            }

            setMessage('Votre mot de passe a été modifié avec succès ! Vous allez être redirigé...');
            toast.success('Mot de passe mis à jour !');
            setTimeout(() => {
                router.push('/auth/signin');
            }, 2500);

        } catch (err: any) {
            setError(err.message || 'Une erreur inconnue est survenue.');
            toast.error(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };
    
    // Si le token est manquant au chargement initial, afficher un message clair.
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Jeton Invalide</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600">
                            Le lien de réinitialisation est invalide ou a expiré. Veuillez vous assurer que vous utilisez le bon lien de votre e-mail ou demandez une nouvelle réinitialisation.
                        </p>
                        <div className="mt-6">
                           <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                                Demander un nouveau lien
                           </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
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
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-purple-800 to-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{backgroundImage: "url('/images/bg.png')"}}></div>
                    <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 animate-fadeInUp">
                        <div className="mb-8 animate-float">
                           <Image src="/logo.png" alt="FishChain Logo" width={80} height={80} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4 text-center">Créez votre nouveau mot de passe</h1>
                        <p className="text-lg text-center text-white/80">Assurez la sécurité de votre compte avec un mot de passe fort.</p>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-slate-50">
                    <div className="w-full max-w-md animate-scale-in">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle>Nouveau mot de passe</CardTitle>
                                <p className="text-slate-600 mt-2">Saisissez et confirmez votre nouveau mot de passe.</p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {message && (
                                        <div className="bg-green-50 border-l-4 border-green-400 text-green-800 p-4 rounded-md flex items-start space-x-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                            <div><p className="font-bold">Succès</p><p>{message}</p></div>
                                        </div>
                                    )}
                                    {error && (
                                        <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-md flex items-start space-x-3">
                                            <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5" />
                                            <div><p className="font-bold">Erreur</p><p>{error}</p></div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label htmlFor="password" className="text-slate-700 font-medium">Nouveau mot de passe</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
                                            <input id="password" type={showPassword ? "text" : "password"} placeholder="8+ caractères" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading || !!message} className="pl-12 pr-12 w-full h-12 border-2 bg-slate-100/50 border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg transition-all" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirmer le mot de passe</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
                                            <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Retapez votre mot de passe" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading || !!message} className="pl-12 pr-12 w-full h-12 border-2 bg-slate-100/50 border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg transition-all" />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                                        </div>
                                    </div>
                                    
                                    <button type="submit" disabled={loading || !!message} className="w-full flex justify-center items-center h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                                        {loading ? <LoaderCircle className="animate-spin" /> : 'Mettre à jour le mot de passe'}
                                    </button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

// Le composant par défaut qui enveloppe la logique dans Suspense
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
            <ResetPasswordComponent />
        </Suspense>
    );
}
