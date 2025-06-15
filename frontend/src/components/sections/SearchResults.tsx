// frontend/src/components/sections/SearchResults.tsx
import React from 'react';
// You will need a ProductCard component
// import ProductCard from '../ProductCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SearchResults = ({ results, loading }: { results: any[], loading: boolean }) => {
  if (loading) {
    return <div className="text-center p-10">Searching...</div>;
  }

  if (results.length === 0) {
    return null; // Don't show anything if there are no results
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-6">Search Results</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map(product => (
          // Replace this div with your actual ProductCard component
          <div key={product.id} className="border rounded-lg p-4">
            <h3 className="font-bold">{product.name}</h3>
            <p>{product.description}</p>
            <p className="font-bold mt-2">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;