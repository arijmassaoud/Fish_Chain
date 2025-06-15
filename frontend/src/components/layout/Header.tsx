// frontend/src/components/layout/Header.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '../LanguageSwitcher';
import {
    Menu, X, User, LogOut,  ShoppingBag, MessageSquareText,
    Home, Fish, Book, HelpCircle,    Settings, ChevronDown,Webcam
} from 'lucide-react';

import logo from '../../../public/design/logo (2).png'
// --- Reusable Data & Components (Defined outside for performance) ---

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/products", icon: Fish, label: "Products" },
    { href: "/blog", icon: Book, label: "Blog" },
    { href: "/faq", icon: HelpCircle, label: "FAQ" },

    
    {href:'/meteo',icon:Webcam,label:"Meteo"},
];

const userDropdownItems = [
  { id: 'profile', href: "/profile", icon: User, label: "Profile" },
  { id: 'dashboard', href: "/dashboard", icon: MessageSquareText, label: "Dashboard" },
  { id: 'orders', href: "/dashboard/reservations", icon: ShoppingBag, label: "My Orders" },
  { id: 'messages', href: "/dashboard/messages", icon: MessageSquareText, label: "Messages" },
];

// Sub-component for desktop navigation links
const NavLink: React.FC<{ item: typeof navItems[0] }> = ({ item }) => (
  <Link href={item.href} className="group flex items-center gap-2 text-white hover:text-accent transition-colors duration-200 px-3 py-2 rounded-md">
    <item.icon size={18} className="opacity-80 group-hover:opacity-100" />
    <span className="font-medium">{item.label}</span>
  </Link>
);

// Sub-component for user dropdown links
const DropdownLink: React.FC<{ item: typeof userDropdownItems[0], onClick: () => void }> = ({ item, onClick }) => (
  <Link
    href={item.href}
    onClick={onClick}
    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md"
  >
    <item.icon size={16} className="mr-3 text-gray-500" />
    <span>{item.label}</span>
  </Link>
);

// --- Main Header Component ---

export default function Header() {

    // ✅ FIX: Add state to track scroll position
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isScrolled, setIsScrolled] = React.useState(false);

    // ✅ FIX: Add an effect to listen for scroll events
    React.useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            // Set state to true if user has scrolled more than 10px, otherwise false
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        
        // Cleanup the event listener on component unmount
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);










    const { user, logout, loading: userLoading } = useAuth();
  
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    const userDropdownRef = React.useRef<HTMLDivElement>(null);
    const mobileMenuRef = React.useRef<HTMLDivElement>(null);
    const mobileMenuButtonRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        setMounted(true);

        const handleClickOutside = (event: MouseEvent) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node) &&
                mobileMenuButtonRef.current &&
                !mobileMenuButtonRef.current.contains(event.target as Node)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        setIsUserDropdownOpen(false);
        await logout();
    };

   
    const userFirstName = user?.name?.split(' ')[0] ?? 'User';

    return (
        <header  className={`w-full fixed top-0 z-50 transition-all duration-300
                ${isScrolled 
                    ? 'bg-primary dark:bg-gray-950 shadow-lg border-b border-black/10 dark:border-white/10' 
                    : 'bg-transparent border-b border-transparent'
                }
            `}>
            <div className="container-section">
                 <div className="flex items-center justify-between h-20">
          
                {/* Larger, Animated Logo */}
                <Link href="/" className="flex items-center flex-shrink-0 hover:animate-pulse transition-transform duration-300 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    {mounted ? (
                        <Image src={logo} alt="FishChain Logo" width={180} height={50} priority unoptimized />
                    ) : (
                        <div className="h-10 w-44 bg-white/10 rounded animate-pulse" />
                    )}
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex flex-grow justify-center items-center gap-4">
                    {navItems.map((item) => <NavLink key={item.href} item={item} />)}
                </nav>

                {/* Right-side Controls: User Menu, Auth Buttons, Theme Toggle */}
                <div className="flex items-center gap-4">
                  
                    
                    <div className="hidden lg:flex items-center gap-4">
                        {userLoading ? (
                            <div className="h-10 w-24 bg-white/10 rounded-full animate-pulse" />
                        ) : user ? (
                            // -- Desktop User Dropdown --
                            <div className="relative" ref={userDropdownRef}>
                                <button
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-secondary-dark transition-colors shadow-md text-white font-semibold"
                                >
                                    <User size={18} />
                                    <span>{userFirstName}</span>
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isUserDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 p-2 animate-fade-in-down-quick">
                                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                        </div>
                                       {userDropdownItems.map(item => (<DropdownLink key={item.id} item={item} onClick={() => setIsUserDropdownOpen(false)} />))}

                                        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                                            <button onClick={handleSignOut} className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors rounded-md">
                                                <LogOut size={16} className="mr-3" /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // -- Desktop Auth Buttons --
                            <>
                           
                                <Link href="/auth/signin" className="px-5 py-2 rounded-full bg-secondary text-white hover:bg-secondary-dark transition-colors text-sm font-bold shadow">
                                    Sign In
                                </Link>
                                <Link href="/auth/register" className="px-5 py-2 rounded-full text-white border-2 border-white/50 hover:bg-white/10 transition-colors text-sm font-bold">
                                    Sign Up
                                </Link>
                                  <LanguageSwitcher/>
                            </>
                        )}
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <button
                        ref={mobileMenuButtonRef}
                        className="lg:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
          </div>
            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div ref={mobileMenuRef} className="lg:hidden absolute top-full left-0 w-full bg-black/20 backdrop-blur-md border-t border-white/10 shadow-2xl ">
                    <nav className="flex flex-col gap-1 p-4">
                        {navItems.map(item => (
                            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center space-x-2 text-white/90 hover:text-white transition-all duration-300 px-4 py-2 rounded-full hover:bg-white/10">
                                <item.icon size={20} /> <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                        <div className="border-t border-white/10 my-2" />
                        {user ? (
                            <>
                                {userDropdownItems.map(item => (
                                    <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center space-x-2 text-white/90 hover:text-white transition-all duration-300 px-4 py-2 rounded-full hover:bg-white/10">
                                        <item.icon size={20} /> <span className="font-medium">{item.label}</span>
                                    </Link>
                                ))}
                                {user.role === 'ADMIN' && (
                                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center space-x-2 text-white/90 hover:text-white transition-all duration-300 px-4 py-2 rounded-full hover:bg-white/10">
                                        <Settings size={20} /> <span className="font-medium">Admin Panel</span>
                                    </Link>
                                )}
                                <div className="border-t border-white/10 my-2" />
                                <button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} className="group flex items-center space-x-2 text-white/90 hover:text-white transition-all duration-300 px-4 py-2 rounded-full hover:bg-white/10">
                                    <LogOut size={20} /> <span className="font-medium">Sign Out</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 pt-2">
                                <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center space-x-2 text-white/90 hover:text-white transition-all duration-300 px-4 py-2 rounded-full hover:bg-white/10">
                                    Sign In
                                </Link>
                                <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center space-x-2 text-white/90 hover:text-white transition-all duration-300 px-4 py-2 rounded-full hover:bg-white/10">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}