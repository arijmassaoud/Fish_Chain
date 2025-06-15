// frontend/src/components/sections/HeroSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Fish, Search, X, Lightbulb, TrendingUp } from 'lucide-react';

// ✅ FIX 1: Define an interface for all the props the component will receive.
// This tells TypeScript what data to expect.
interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchResults: any[]; // You can replace 'any' with a more specific type if you have one
  searchSuggestions: string[];
  searchHistory: { query: string; timestamp: number; }[];
  isSearching: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;
  handleSearch: (query?: string) => Promise<void>;
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearSearch: () => void;
}

// ✅ FIX 2: Update the component to accept the props object.
export default function HeroSection({
  searchQuery,
  searchSuggestions,
  searchHistory,
  searchInputRef,
  handleSearch,
  handleSearchInputChange,
  clearSearch,
}: HeroSectionProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bubbles, setBubbles] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fishes, setFishes] = useState<any[]>([]);

  useEffect(() => {
    // Generate random bubbles and fishes only on the client side
    const generatedBubbles = [...Array(10)].map(() => ({
      width: `${Math.random() * 30 + 10}px`,
      height: `${Math.random() * 30 + 10}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 10 + 15}s`,
      animationDelay: `${Math.random() * 5}s`,
    }));

    const generatedFishes = [...Array(5)].map(() => ({
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 80 + 10}%`,
      transform: `rotate(${Math.random() * 360}deg)`,
      fontSize: `${Math.random() * 20 + 20}px`,
      animationDuration: `${Math.random() * 5 + 5}s`,
      animationDelay: `${Math.random() * 2}s`,
      size: Math.random() * 30 + 20,
    }));

    setBubbles(generatedBubbles);
    setFishes(generatedFishes);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-screen  bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-800   flex items-center justify-center">
      {/* Background Image and Overlays */}
      <Image
        src="/images/herobg.jpg"
        alt="Ethereal underwater scene with soft light rays and distant fish"
        fill
        priority
        className="object-cover object-center scale-105 animate-zoom-fade-in opacity-70 dark:opacity-40"
        quality={90}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-primary-900/20 to-transparent dark:from-gray-950/80 dark:via-gray-950/60 dark:to-transparent"></div>

      {/* Animated Bubbles and Fishes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {bubbles.map((bubble, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm animate-float"
            style={bubble}
          />
        ))}
        {fishes.map((fish, i) => (
          <div
            key={`fish-${i}`}
            className="absolute text-aqua-300/60 dark:text-aqua-500/40 animate-swim"
            style={{ ...fish }}
          >
            <Fish size={fish.size} />
          </div>
        ))}
      </div>

      {/* Main Content (Text and Search) */}
      <div className=" px-6 relative z-30 text-white max-w-5xl">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-6 animate-fade-in-up-delay-1 text-aqua-glow-gradient dark:text-aqua-glow-gradient-dark">
          Your Ocean of Delights.
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl opacity-90 mb-10 animate-fade-in-up-delay-2 text-shadow-soft">
          Explore the freshest, traceable, and sustainable seafood from Tunisia, caught with love.
        </p>

        {/* AI-Powered Search Bar */}
        <div className="relative w-full max-w-2xl mx-auto animate-fade-in-up-delay-3">
          <input
            type="text"
            placeholder="Find your favorite fish, discover new recipes..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            ref={searchInputRef}
            className="w-full py-4 pl-6 pr-14 rounded-full text-lg bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 shadow-2xl focus:outline-none focus:ring-4 focus:ring-secondary/50 dark:focus:ring-secondary/50 transition-all duration-300 border-2 border-transparent hover:border-aqua-300 dark:hover:border-secondary transform hover:scale-[1.01]"
          />
          <button
            onClick={() => handleSearch()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-dark hover:to-secondary-dark transition-all duration-300 shadow-md transform hover:scale-110 active:scale-95"
            aria-label="Search"
          >
            <Search size={24} />
          </button>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-16 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-coral-500 transition-colors transform hover:scale-110"
              aria-label="Clear search"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* Search Suggestions & History */}
        {(searchSuggestions.length > 0 || searchHistory.length > 0) && (
          <div className="absolute top-full mt-3 w-full max-w-2xl mx-auto bg-white/98 dark:bg-gray-800/98 rounded-lg shadow-2xl text-left text-gray-800 dark:text-gray-200 z-40 animate-fade-in-down border border-aqua-300 dark:border-secondary overflow-hidden">
            {searchSuggestions.length > 0 && (
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-primary-50 dark:bg-gray-700">
                <p className="font-semibold text-primary-700 dark:text-primary-300 mb-2 flex items-center"><Lightbulb size={18} className="mr-2 text-yellow-500 dark:text-yellow-300" /> AI Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {searchSuggestions.map((s, i) => (
                    <button key={i} onClick={() => handleSearch(s)} className="px-3 py-1.5 bg-primary-100 dark:bg-gray-600 text-primary-800 dark:text-gray-200 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-gray-500 transition-colors transform hover:scale-105 active:scale-95">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {searchHistory.length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-750">
                <p className="font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center"><TrendingUp size={18} className="mr-2 text-green-500 dark:text-green-300" /> Recent Adventures:</p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((h, i) => (
                    <button key={i} onClick={() => handleSearch(h.query)} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors transform hover:scale-105 active:scale-95">{h.query}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-wave-bottom-hero transform rotate-180 origin-bottom scale-x-125 md:scale-x-100 z-20"></div>
    </section>
  );
}