'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import Image from 'next/image';
import ProductCard  from './ProductCard';

import { Product } from '@/types';

type Content = { products?: Product[]; text?: string; imageUrl?: string | null; } | null;
type RecommendationType = 'similar' | 'season' | 'recipe';

interface AIRecommendationsProps {
  productId: string;
}

export default function AIRecommendations({ productId }: AIRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<RecommendationType>('similar');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<Content>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!productId) return;
      setLoading(true);
      setContent(null);
      try {
        const response = await fetch(`/api/products/${productId}/recommendations?type=${activeTab}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch.');
        }
        setContent(await response.json());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setContent({ text: `Sorry, an error occurred: ${err.message}` });
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [productId, activeTab]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
          <div className="w-8 h-8 border-4 border-gray-500 border-t-white rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Contacting AI Assistant...</p>
        </div>
      );
    }
    if (!content || (!content.products && !content.text)) {
      return <div className="p-6 text-center text-gray-400">No recommendations available.</div>;
    }

    const markdownComponents: Components = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-white mb-4 border-b-2 border-blue-400 pb-2" {...props} />,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-cyan-300 mt-6 mb-3" {...props} />,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        p: ({node, ...props}) => <p className="text-slate-300 leading-relaxed mb-4" {...props} />,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        strong: ({node, ...props}) => <strong className="font-bold text-cyan-400" {...props} />,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ul: ({node, ...props}) => <ul className="list-none pl-2 space-y-3" {...props} />,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        li: ({node, ...props}) => (
            <li className="flex items-start">
                <span className="text-cyan-500 mr-3 mt-1 text-xl">&#8227;</span> 
                <span className="flex-1 text-slate-300">{props.children}</span>
            </li>
        ),
    }

    if (content.text && content.imageUrl) {
        return (
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
                <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-105">
                    <Image src={content.imageUrl} alt="AI Generated Recommendation" fill className="object-cover"/>
                </div>
                <div className="max-w-full">
                    <ReactMarkdown components={markdownComponents}>{content.text}</ReactMarkdown>
                </div>
            </div>
        )
    }
    
    if (activeTab === 'similar' && content.products) {
       if (content.products.length === 0) return <div className="p-6 text-center">No similar products found.</div>;
      return (
        <div className="p-4 md:p-8 animate-fade-in">
            {content.imageUrl && (
                <div className="mb-8">
                    <div className="text-center mx-auto mb-4">
                        <ReactMarkdown components={markdownComponents}>{content.text || ''}</ReactMarkdown>
                    </div>
                    <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-2xl">
                        <Image src={content.imageUrl} alt="AI Generated Similar Products" fill className="object-cover"/>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
      );
    }

    return <div className="p-6"><ReactMarkdown components={markdownComponents}>{content.text || ''}</ReactMarkdown></div>;
  };

  function TabButton({ title, type }: { title: string; type: RecommendationType }) {
    const isActive = activeTab === type;
    return (
      <button
        onClick={() => setActiveTab(type)}
        disabled={loading}
        className={`flex-1 p-4 font-semibold text-center transition-all duration-300 disabled:cursor-not-allowed relative ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
      >
        {title}
        {isActive && (<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-white rounded-full"></div>)}
      </button>
    );
  }

  return (
    <div className="mt-16 w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI-Powered Recommendations</h2>
            <p className="mt-2 text-lg text-gray-500">Discover more with our AI assistant</p>
        </div>
        <div className="rounded-2xl bg-slate-900 bg-opacity-90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex border-b border-white/10"><TabButton title="Similar Products" type="similar" /><TabButton title="Fishing Season" type="season" /><TabButton title="Recipe Ideas" type="recipe" /></div>
            <div className="min-h-[450px]">{renderContent()}</div>
        </div>
    </div>
  );
}
