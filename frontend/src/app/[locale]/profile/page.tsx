'use client';

import { useEffect, useState, ReactNode } from 'react'; // Added ReactNode for UI components
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // Assuming you have sonner for toasts
import { User, Lock, Activity, Pencil, Save, XCircle, KeyRound ,LoaderCircle,Mail} from 'lucide-react'; // Added icons

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

type TabType = 'profile' | 'security' | 'activity';

// --- Reusable UI Components (Inspired by your login/register pages) ---
// These should ideally be global components if used across multiple pages
const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200/80 ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`p-8 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }: { children: ReactNode; className?: string }) => <h2 className={`text-3xl font-bold text-slate-800 ${className}`}>{children}</h2>;
const CardContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`p-8 pt-0 ${className}`}>{children}</div>;
const InputField = ({ label, type = 'text', value, onChange, disabled = false, placeholder = '', icon: Icon }: {
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    placeholder?: string;
    icon?: React.ElementType; // Lucide icon component
}) => (
    <div className="space-y-2">
        <label htmlFor={label} className="text-slate-700 font-medium">{label}</label>
        <div className="relative group">
            {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />}
            <input
                id={label}
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className={`pl-12 w-full h-12 border-2 bg-slate-100/50 border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg transition-all duration-300 ${Icon ? 'pl-12' : 'pl-4'}`}
            />
        </div>
    </div>
);
const PrimaryButton = ({ children, onClick, type = 'button', disabled = false, className = '' }: {
    children: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    className?: string;
}) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex justify-center items-center h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);
const OutlineButton = ({ children, onClick, className = '' }: {
    children: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => void;
    className?: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2 ${className}`}
    >
        {children}
    </button>
);
// --- End Reusable UI Components ---


export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const result = await response.json();
                if (result.success && result.data) {
                    setProfile(result.data);
                    setEditForm({
                        name: result.data.name,
                        email: result.data.email,
                    });
                } else {
                    throw new Error(result.message || 'Failed to load profile');
                }
            } catch (err) {
                setError('Failed to load profile');
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
                setIsEditing(false);
                setProfile(prev => prev ? { ...prev, ...editForm } : null);
                toast.success('Profile updated successfully!'); // Sonner toast
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
                toast.error(result.message || 'Failed to update profile'); // Sonner toast
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
            toast.error('Failed to update profile'); // Sonner toast
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            toast.error('New passwords do not match'); // Sonner toast
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Password updated successfully' });
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
                toast.success('Password updated successfully!'); // Sonner toast
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to update password' });
                toast.error(result.message || 'Failed to update password'); // Sonner toast
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update password' });
            toast.error('Failed to update password'); // Sonner toast
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-800 to-slate-900 text-white">
                <LoaderCircle className="animate-spin h-10 w-10 text-white" />
                <span className="ml-3 text-lg">Loading profile...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-red-700 text-white">
                <div className="text-center text-xl p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                    <XCircle className="inline-block h-8 w-8 mr-2" />
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto animate-fadeInUp">
                {/* Profile Header Card */}
                <Card className="mb-8 p-6 flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-indigo-700 to-purple-600 text-white shadow-lg">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                        <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-md">
                            <span className="text-4xl font-bold text-purple-700">
                                {profile?.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{profile?.name}</h1>
                            <p className="text-lg text-indigo-200">{profile?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-purple-700 shadow-sm">
                            {profile?.role.toUpperCase()}
                        </span>
                        <span className="text-sm text-indigo-200">
                            Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </Card>

                {/* Tabs Card */}
                <Card className="mb-8">
                    <div className="border-b border-slate-200 p-2">
                        <nav className="flex -mb-px justify-around">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`${
                                    activeTab === 'profile'
                                        ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                                        : 'border-transparent text-slate-600 hover:text-indigo-700 hover:border-indigo-300'
                                } flex-1 py-3 px-1 text-center border-b-2 font-medium text-base transition-all duration-300 rounded-t-lg`}
                            >
                                <User className="inline-block mr-2" size={18} />
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`${
                                    activeTab === 'security'
                                        ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                                        : 'border-transparent text-slate-600 hover:text-indigo-700 hover:border-indigo-300'
                                } flex-1 py-3 px-1 text-center border-b-2 font-medium text-base transition-all duration-300 rounded-t-lg`}
                            >
                                <Lock className="inline-block mr-2" size={18} />
                                Security
                            </button>
                            <button
                                onClick={() => setActiveTab('activity')}
                                className={`${
                                    activeTab === 'activity'
                                        ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                                        : 'border-transparent text-slate-600 hover:text-indigo-700 hover:border-indigo-300'
                                } flex-1 py-3 px-1 text-center border-b-2 font-medium text-base transition-all duration-300 rounded-t-lg`}
                            >
                                <Activity className="inline-block mr-2" size={18} />
                                Activity
                            </button>
                        </nav>
                    </div>
                </Card>

                {/* Message Display (now using styled divs) */}
                {message.text && (
                    <div
                        className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-semibold shadow-md ${
                            message.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'
                        }`}
                    >
                        {message.type === 'success' ? <Save size={20} /> : <XCircle size={20} />}
                        {message.text}
                    </div>
                )}

                {/* Tab Content Card */}
                <Card className="p-8">
                    {activeTab === 'profile' && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-800">Profile Information</h2>
                                <OutlineButton onClick={() => setIsEditing(!isEditing)} className="text-indigo-600 hover:bg-indigo-50">
                                    {isEditing ? (
                                        <>
                                            <XCircle size={18} /> Cancel
                                        </>
                                    ) : (
                                        <>
                                            <Pencil size={18} /> Edit Profile
                                        </>
                                    )}
                                </OutlineButton>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleEditSubmit} className="space-y-6">
                                    <InputField
                                        label="Name"
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="Your full name"
                                        icon={User}
                                    />
                                    <InputField
                                        label="Email"
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        placeholder="your.email@example.com"
                                        icon={Mail}
                                    />
                                    <div className="flex justify-end pt-4">
                                        <PrimaryButton type="submit" className="w-auto px-8">
                                            <Save size={20} className="mr-2" /> Save Changes
                                        </PrimaryButton>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                                        <div className="text-slate-900 text-lg font-medium">{profile?.name}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                                        <div className="text-slate-900 text-lg font-medium">{profile?.email}</div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                                        <div className="text-slate-900 text-lg font-medium capitalize">{profile?.role.toLowerCase()}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-8">Change Password</h2>
                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <InputField
                                    label="Current Password"
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    placeholder="Enter your current password"
                                    icon={KeyRound}
                                />
                                <InputField
                                    label="New Password"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    placeholder="Enter your new password"
                                    icon={Lock}
                                />
                                <InputField
                                    label="Confirm New Password"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    placeholder="Confirm your new password"
                                    icon={Lock}
                                />
                                <div className="flex justify-end pt-4">
                                    <PrimaryButton type="submit" className="w-auto px-8">
                                        <Save size={20} className="mr-2" /> Update Password
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-8">Recent Activity</h2>
                            <div className="bg-slate-50 p-6 rounded-lg text-center text-slate-500 py-8 border border-dashed border-slate-300">
                                <Activity className="inline-block h-10 w-10 mb-3 text-slate-400" />
                                <p className="text-lg">Your activity history will be displayed here soon!</p>
                                <p className="text-sm mt-1">Check back later for updates.</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}