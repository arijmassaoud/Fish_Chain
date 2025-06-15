// frontend/src/components/sections/ConnectSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'; // Social icons

// --- IMAGE ASSETS ---

export default function ConnectSection() {
  return (
    <section className="bg-gradient-to-br from-primary to-secondary text-white px-6 py-16 md:py-24 text-center relative overflow-hidden z-10">
      <div className="absolute inset-0 opacity-0 md:opacity-5 animate-slow-spin bg-contain bg-no-repeat bg-center"></div>

      <div className="container mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-8 animate-fade-in-up-delay-1 text-aqua-glow-gradient dark:text-aqua-glow-gradient-dark">
          Connect with Your Aqua-Family!
        </h2>
        <p className="text-lg opacity-80 mb-10 animate-fade-in-up-delay-2">
          Swim along with us on social media for fresh updates, delightful recipes, and behind-the-scenes adventures!
        </p>
        <div className="flex justify-center gap-8 mb-12 animate-fade-in-up-delay-3">
          <a href="https://facebook.com/fishchain" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary transition-colors transform hover:scale-125 animation-scale-in animation-scale-in-delay-1"><Facebook size={48} /></a>
          <a href="https://instagram.com/fishchain" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 transition-colors transform hover:scale-125 animation-scale-in animation-scale-in-delay-2"><Instagram size={48} /></a>
          <a href="https://linkedin.com/company/fishchain" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary transition-colors transform hover:scale-125 animation-scale-in animation-scale-in-delay-3"><Linkedin size={48} /></a>
          <a href="https://youtube.com/fishchain" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 transition-colors transform hover:scale-125 animation-scale-in animation-scale-in-delay-4"><Youtube size={48} /></a>
        </div>
        <Link href="/contact" className="inline-flex items-center bg-gradient-to-r from-aqua-500 to-coral-500 hover:from-aqua-600 hover:to-coral-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up-delay-4">
          Send a Wave <ArrowRight className="inline-block ml-2 w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}