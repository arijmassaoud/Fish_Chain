'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import {
    LayoutDashboard,
    LogOut,
    Mail,
    Menu,
    Percent,
    ReceiptText,
    ShoppingBasket,
    Users,
    Folder,
    ShieldCheck,
    Home, // Import the Home icon for the button
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import SideNavLink from '../../components/sideNavLink';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from '../../components/UI/sheet';
import { Button } from '@/components/UI/button';
import Image from 'next/image';
import Link from 'next/link';

// --- Type Definition ---
interface NavLink {
    href: string;
    icon: ReactNode;
    title: string;
}

// --- Navigation Links ---
const navLinksAdmin: NavLink[] = [
    { href: '/dashboard', icon: <LayoutDashboard size={20} />, title: 'Dashboard' },
    { href: '/dashboard/veterinarian', icon: <ShieldCheck size={20} />, title: 'Review Products' },
    { href: '/dashboard/products', icon: <ShoppingBasket size={20} />, title: 'Products' },
    { href: '/dashboard/categories', icon: <Folder size={20} />, title: 'Categories' },
    { href: '/dashboard/reservations', icon: <ReceiptText size={20} />, title: 'Orders' },
    { href: '/dashboard/users', icon: <Users size={20} />, title: 'Users' },
    { href: '/dashboard/messages', icon: <Mail size={20} />, title: 'Messages' },
    { href: '/dashboard/coupons', icon: <Percent size={20} />, title: 'Coupons' },
];

const navLinksSeller: NavLink[] = [
    { href: '/dashboard', icon: <LayoutDashboard size={20} />, title: 'Dashboard' },
    { href: '/dashboard/products', icon: <ShoppingBasket size={20} />, title: 'My Products' },
    { href: '/dashboard/reservations', icon: <ReceiptText size={20} />, title: 'My Orders' },
    { href: '/dashboard/messages', icon: <Mail size={20} />, title: 'Messages' },
];

const navLinksBuyer: NavLink[] = [
    { href: '/dashboard', icon: <LayoutDashboard size={20} />, title: 'Dashboard' },
    { href: '/dashboard/reservations', icon: <ReceiptText size={20} />, title: 'My Reservations' },
    { href: '/dashboard/messages', icon: <Mail size={20} />, title: 'Messages' },
];

const navLinksVet: NavLink[] = [
    { href: '/dashboard', icon: <LayoutDashboard size={20} />, title: 'Dashboard' },
    { href: '/dashboard/veterinarian', icon: <ShieldCheck size={20} />, title: 'Review Products' },
];

// --- Avatar Component ---
const UserAvatar = ({ name }: { name: string }) => {
    const getInitials = (nameStr: string) => {
        if (!nameStr) return 'U';
        const words = nameStr.split(' ').filter(Boolean);
        if (words.length > 1) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return nameStr.substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 text-white font-bold text-sm select-none border-2 border-slate-600">
            {getInitials(name)}
        </div>
    );
};

// --- Reusable Navigation Content ---
const NavContent = ({ navLinks, pathName, handleSignOut }: {
    navLinks: NavLink[];
    pathName: string;
    handleSignOut: () => void;
}) => {
    const { user } = useAuth();

    return (
        <>
            <div className="flex-shrink-0 px-4 pt-4">
                <Link href="/dashboard" className="flex items-center">
                    <Image src="/logo.png" alt="logo" width={300} height={300} />
                </Link>
            </div>

            <nav className="flex-1 mt-8 space-y-1 overflow-y-auto custom-scrollbar px-4">
                {navLinks.map((link) => (
                    <SideNavLink
                        key={link.title}
                        href={link.href}
                        title={link.title}
                        icon={link.icon}
                        active={pathName === link.href}
                    />
                ))}

                {/* --- Go Back to Home Page Button --- */}
                <div className="pt-4 border-t border-white/10 mt-4"> {/* Added top padding and border for separation */}
                    <SideNavLink
                        href="/" // Link to the root home page
                        title="Back to Home Page"
                        icon={<Home size={20} />} // Use the Home icon
                        active={pathName === '/'} // Highlight if on the home page
                        className="text-white bg-indigo-700 hover:bg-indigo-600 transition-colors py-2 px-4 rounded-md flex items-center gap-3 font-semibold"
                    />
                </div>
                {/* --- End Go Back to Home Page Button --- */}

            </nav>

            <div className="flex-shrink-0 p-4 border-t border-white/10">
                <div className="flex items-center w-full">
                    <UserAvatar name={user?.name || 'User'} />
                    <div className="ml-3 text-left">
                        <p className="text-sm font-semibold text-white truncate capitalize">{user?.role?.toLowerCase() || 'Role'}</p>
                    </div>
                </div>
                <SideNavLink
                    type="button"
                    icon={<LogOut size={20} />}
                    title="Logout"
                    href=""
                    onClick={handleSignOut}
                />
            </div>
        </>
    );
};

// --- Main Sidebar Component ---
export default function SideNav() {
    const { user, logout } = useAuth();
    const pathName = usePathname();

    const navLinks = user ? (() => {
        switch (user.role) {
            case 'ADMIN': return navLinksAdmin;
            case 'SELLER': return navLinksSeller;
            case 'BUYER': return navLinksBuyer;
            case 'VET': return navLinksVet;
            default: return [];
        }
    })() : [];

    const handleSignOut = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <>
            {/* Custom scrollbar styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1f2937; /* Tailwind gray-800 */
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #4f46e5; /* indigo-600 */
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #6b7280; /* gray-500 */
                }
            `}</style>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:flex-shrink-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-slate-900 border-r border-white/10">
                <NavContent navLinks={navLinks} pathName={pathName} handleSignOut={handleSignOut} />
            </aside>

            {/* Mobile Sidebar */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-slate-800/80 backdrop-blur-sm border-slate-700 text-primary hover:bg-slate-700">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="bg-gradient-to-br from-indigo-900 via-purple-800 to-slate-900 text-primary p-0 w-[280px] border-r border-white/10 flex flex-col"
                    >
                        <div className="flex flex-col h-full">
                            <NavContent navLinks={navLinks} pathName={pathName} handleSignOut={handleSignOut} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}