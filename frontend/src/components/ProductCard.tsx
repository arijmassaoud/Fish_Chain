// file: components/ProductCard.tsx

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types'; // Assuming you have a central types file
import { formatCurrency } from '../contexts/utils'; // 1. Import the currency formatter

interface ProductCardProps {
  product: Product;
}

// FIX: Changed to a default export to resolve the "Unsupported Server Component" error.
// This ensures that when this component is imported, it's treated as the default module.
export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block animate-fade-in">
      <div className="overflow-hidden rounded-lg bg-white bg-opacity-80 backdrop-blur-sm shadow-lg transition-shadow duration-300 hover:shadow-2xl hover:bg-opacity-100">
        <div className="relative h-48 w-full">
          <Image
            src={product.imageUrl || '/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4 text-center">
          <h3 className="truncate font-semibold text-gray-800">{product.name}</h3>
          {/* --- Use the formatCurrency function for the price --- */}
          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatCurrency(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}
