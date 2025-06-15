// frontend/src/components/sections/FeaturedProductsSection.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Share2, MessageSquareText} from 'lucide-react'; // Added Star

import { formatCurrency } from '../../contexts/utils'; // 2. Corrected the import path

// --- TYPE DEFINITIONS ---
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

// Props for ProductCardWithReactions
interface ProductCardWithReactionsProps {
  product: Product;
  animationDelay: number;
}

const ProductCardWithReactions: React.FC<ProductCardWithReactionsProps> = ({ product, animationDelay }) => {
  const [heartReacted, setHeartReacted] = useState(false);
  const handleHeartReact = (e: React.MouseEvent) => {
    e.preventDefault();
    setHeartReacted(prev => !prev);
    // TODO: Add actual API call to record reaction (e.g., to backend /api/products/:id/react)
    console.log(`User ${heartReacted ? 'unreacted' : 'reacted'} to product ${product.id}`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description.substring(0, 100) + '...',
        url: window.location.origin + `/products/${product.id}`,
      }).then(() => console.log('Shared successfully'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
      alert(`Share this product: ${window.location.origin}/products/${product.id}`);
    }
  };

  return (
    <Link
      key={product.id}
      href={`/products/${product.id}`}
      className={` group block rounded-xl overflow-hidden shadow-lg border border-gray-700 dark:border-gray-700 hover:border-aqua-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl bg-gray-800 dark:bg-gray-900 animate-fade-in-up-delay-${animationDelay} cursor-pointer`}
    >
      <div className="relative  h-64 w-full overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover z-0 object-center group-hover:scale-105 transition-transform duration-500 ease-in-out"
          quality={70}
        />
        <div className="absolute  inset-0 transparent"></div>
        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-aqua-600 to-coral-600 backdrop-blur-sm text-white font-bold text-xl py-2 px-4 rounded-full shadow-md">
          {formatCurrency(product.price)}
        </div>
        {/* Reaction and Share Buttons (Hover) */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
                onClick={handleHeartReact}
                className={`p-2 rounded-full bg-white/20 hover:bg-white/30 text-white ${heartReacted ? 'text-red-400' : ''}`}
                aria-label="React with heart"
            >
                <Heart size={20} className={heartReacted ? 'animate-heart-pulse' : ''} />
            </button>
            <button
                onClick={handleShare}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
                aria-label="Share product"
            >
                <Share2 size={20} />
            </button>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
        <p className="text-sm text-gray-400">{product.category.name}</p>
        <p className="text-sm text-gray-300 mt-2 line-clamp-2">{product.description}</p>
        {/* Reactions and Comments Display */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
          {product.reactions && (
            <span className="flex items-center">
              <Heart size={14} className="mr-1 text-red-300" /> {product.reactions.heart}
            </span>
          )}
          {product.commentsCount !== undefined && (
            <span className="flex items-center">
              <MessageSquareText size={14} className="mr-1 text-primary" /> {product.commentsCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default function FeaturedProductsSection({ featuredProducts, loadingProducts }: { featuredProducts: Product[]; loadingProducts: boolean; }) {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden z-10">
      <div className="absolute inset-0 z-0 opacity-15 animate-subtle-float-reverse dark:opacity-5" style={{ backgroundImage: `url('/images/bg.png')`, backgroundSize: '200px', backgroundRepeat: 'repeat' }}></div>
      <div className=" mx-auto px-6 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 animate-fade-in-up-delay-1">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 sm:mb-0 text-aqua-glow-gradient dark:text-aqua-glow-gradient-dark">
            Today&apos;s Featured Delights
          </h2>
          <Link
            href="/products"
            className="text-lg text-primary hover:text-primary transition-colors flex items-center animate-fade-in-up-delay-2"
          >
            View All Products <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="text-center py-10 text-xl text-gray-200 animate-pulse">Reeling in the freshest catch...</div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-10 text-xl text-gray-200">No special products featured right now.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCardWithReactions product={product} key={product.id} animationDelay={index + 3} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}