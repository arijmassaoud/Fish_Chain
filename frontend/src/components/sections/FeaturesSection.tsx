// frontend/src/components/sections/FeaturesSection.tsx
'use client';

import React from 'react';
import { ShieldCheck, Lightbulb, Fish } from 'lucide-react';

// FIX: Removed the 'image' property from the props interface
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  animationDelay: number;
  iconBgColor: string;
  iconColor: string;
}

// FIX: Removed the 'image' prop from the component's de-structured props
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, animationDelay, iconBgColor, iconColor }) => (
  <div 
    // FIX: Removed the 'group' class as it's no longer needed for image hover effects
    className="relative p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-primary/20 dark:border-gray-700 overflow-hidden transform hover:scale-[1.03] transition-all duration-300 animate-fade-in-up"
    style={{ animationDelay: `${animationDelay}ms` }}
  >
    {/* FIX: The <Image> component has been completely removed. */}
    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-800 dark:via-gray-800/80 dark:to-transparent"></div>
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className={`p-4 rounded-full ${iconBgColor} ${iconColor} shadow-lg mb-5 transform hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-primary dark:text-primary-light mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function FeaturesSection() {
  const features: FeatureCardProps[] = [
    {
      icon: <ShieldCheck size={36} />,
      title: "Unbreakable Transparency",
      description: "Follow your seafood's journey from the ocean to your plate. Our blockchain technology provides an unalterable record of every step, ensuring ultimate freshness and authenticity.",
      // FIX: 'image' property removed
      animationDelay: 200,
      iconBgColor: 'bg-teal-100 dark:bg-teal-900',
      iconColor: 'text-teal-600 dark:text-teal-300',
    },
    {
      icon: <Lightbulb size={36} />,
      title: "Intelligent Discovery",
      description: "Not sure what to cook? Our AI assistant offers personalized recipe suggestions and helps you discover new seasonal favorites tailored to your taste.",
      // FIX: 'image' property removed
      animationDelay: 400,
      iconBgColor: 'bg-yellow-100 dark:bg-yellow-900',
      iconColor: 'text-yellow-600 dark:text-yellow-300',
    },
    {
      icon: <Fish size={36} />,
      title: "Sustainably Sourced",
      description: "We partner with local Tunisian fishermen committed to responsible practices. Enjoy the freshest catch while supporting the health of our oceans for generations to come.",
      // FIX: 'image' property removed
      animationDelay: 600,
      iconBgColor: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-300',
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900 text-gray-800 relative overflow-hidden z-10">
      <div className="container px-6 mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-primary dark:text-primary-light mb-4 animate-fade-in-up">
          Why FishChain?
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400 mb-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Dive into the core values that make our marketplace the most trusted source for fresh, sustainable, and transparently sourced seafood.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
