// frontend/src/app/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Corrected path
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import FeaturedProductsSection from '@/components/sections/FeaturedProductsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ConnectSection from '@/components/sections/ConnectSection';
import Contact from './contact/page';
import About from './about/page';

// --- TYPE DEFINITIONS (from your context) ---
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: {
    name: string;
  };
  reactions?: { heart: number; like: number; funny: number };
  commentsCount?: number;
}

// --- AI Search State Interface ---
interface SearchHistoryEntry {
  query: string;
  timestamp: number;
}


export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { getAuthHeaders } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // --- AI Search State (Managed centrally here) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- Product Data Fetching ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await fetch(`${API_URL}/api/products?limit=8&isFeatured=true`, {
          headers: getAuthHeaders(),
          cache: 'no-store'
        });
        if (response.ok) {
          const { data } = await response.json();
          setFeaturedProducts(data.map((p: Product) => ({
            ...p,
            reactions: { heart: Math.floor(Math.random() * 50) + 10, like: Math.floor(Math.random() * 100) + 20, funny: Math.floor(Math.random() * 10) + 5 },
            commentsCount: Math.floor(Math.random() * 30) + 5
          })));
        } else {
          console.error('Failed to fetch featured products:', response.status);
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('Network error fetching products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [getAuthHeaders, API_URL]);

  // --- AI Search Functionality (Managed centrally here) ---
  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchSuggestions([]);
      return;
    }
    setIsSearching(true);
    setSearchQuery(query);

    setSearchHistory(prev => {
      const newHistory = [{ query, timestamp: Date.now() }, ...prev.filter(e => e.query !== query)];
      return newHistory.slice(0, 5);
    });

    try {
      const response = await fetch(`${API_URL}/api/ai/search-products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setSearchResults(data.products.map((p: Product) => ({
        ...p,
        imageUrl: p.imageUrl || (Math.random() > 0.5 ? '/design/placeholder-product-1.jpg' : '/design/placeholder-product-2.jpg'),
        reactions: { heart: Math.floor(Math.random() * 50), like: Math.floor(Math.random() * 100), funny: Math.floor(Math.random() * 10) },
        commentsCount: Math.floor(Math.random() * 20)
      })) || []);
      setSearchSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('AI Search failed:', error);
      setSearchResults([]);
      setSearchSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const response = await fetch(`${API_URL}/api/ai/search-suggestions`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ query }),
        });
        const data = await response.json();
        setSearchSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('AI Suggestions failed:', error);
        setSearchSuggestions([]);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchSuggestions([]);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br   from-primary via-teal-50 to-pink-50 text-gray-800 font-sans relative overflow-hidden dark:bg-gray-950 dark:text-gray-100">
      {/* Global Background Bubbles/Patterns */}
      <div className="absolute inset-0 z-0 opacity-15 animate-subtle-float dark:opacity-5" ></div>
      <div className="absolute inset-0 z-0 opacity-5 animate-slow-spin-reverse dark:opacity-1" ></div>
      <div  className='relative overflow-hidden min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-800 p-6'>
      {/* Render individual sections */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        searchSuggestions={searchSuggestions}
        searchHistory={searchHistory}
        isSearching={isSearching}
        searchInputRef={searchInputRef}
        handleSearch={handleSearch}
        handleSearchInputChange={handleSearchInputChange}
        clearSearch={clearSearch}
      />
      <About/>
      {searchResults.length > 0 && (
        <FeaturedProductsSection featuredProducts={searchResults} loadingProducts={isSearching} />
      )}

      <FeaturesSection />
      <FeaturedProductsSection featuredProducts={featuredProducts} loadingProducts={loadingProducts} />
     
      <TestimonialsSection />
      <ConnectSection />
       <Contact/>
       </div>
    </div>
  );
}