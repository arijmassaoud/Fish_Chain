// frontend/src/components/sections/TestimonialsSection.tsx
'use client';

import React from 'react';
import { Star } from 'lucide-react'; // Import Star icon

// Props for TestimonialCard
interface TestimonialCardProps {
  quote: string;
  author: string;
  rating: number; // 1-5
  animationDelay: number;
}
const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, rating, animationDelay }) => (
  <div className={`p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-primary-100 dark:border-gray-700 text-center animate-fade-in-up-delay-${animationDelay} transform hover:scale-[1.02] transition-transform duration-300 cursor-pointer`}>
    <div className="flex justify-center mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={`star-filled-${i}`} size={20} fill="currentColor" stroke="none" className="text-yellow-400" />
      ))}
      {[...Array(5 - rating)].map((_, i) => (
        <Star key={`star-empty-${i}`} size={20} fill="currentColor" stroke="none" className="text-gray-300" />
      ))}
    </div>
    <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-4">{quote}</p>
    <p className="font-semibold text-primary-700 dark:text-primary-400">- {author}</p>
  </div>
);

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 relative overflow-hidden z-10">
      <div className="absolute inset-0 z-0 opacity-10 animate-wave-float dark:opacity-5"></div>
      <div className=" mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-primary dark:text-primary-300 mb-16 animate-fade-in-up-delay-1">
          Hear What Our Family Says!
        </h2>
        <div className="px-6 grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <TestimonialCard
            quote="FishChain brought the ocean's magic to my kitchen! The freshness is unbelievable, and the traceability makes me trust every bite."
            author="Amina, Happy Home Chef"
            rating={5}
            animationDelay={2}
          />
          <TestimonialCard
            quote="Finally, a place where I know exactly where my seafood comes from. FishChain is revolutionizing the way we connect with our food. Simply wonderful!"
            author="Karim, Aqua-Conscious Consumer"
            rating={5}
            animationDelay={3}
          />
        </div>
      </div>
    </section>
  );
}