// src/app/faq/page.tsx
'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/UI/button'; // Assuming you have a Button component
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/UI/collapsible'; // And a Collapsible

// This is the static list of FAQs, as before
const faqs = [
    {
      question: "Qu'est-ce que Fish Chain ?",
      answer: "Fish Chain est une plateforme révolutionnaire de gestion de la pêche qui transforme votre entreprise de pêche grâce à des outils modernes de suivi, d'analyse et de gestion."
    },
    {
      question: "Comment puis-je commencer à utiliser Fish Chain ?",
      answer: "Il suffit de vous inscrire sur notre plateforme, de configurer votre profil d'entreprise et de commencer à enregistrer vos activités de pêche. Notre équipe vous accompagne dans la mise en place."
    },
    // ... other FAQs
];

// This is the single, correct component for the page
export default function FAQPage() {
    // State hooks are correctly placed inside the component
    const [openItems, setOpenItems] = useState<number[]>([]);
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiAnswer, setAiAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setAiAnswer('');
        setLoading(true);

        if (aiQuestion.trim().length < 5) {
            setError('Please enter a more detailed question.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/ask-faq`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: aiQuestion }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch AI answer.');
            }
            const data = await response.json();
            setAiAnswer(data.answer);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const toggleItem = (index: number) => {
        setOpenItems(prevOpenItems =>
            prevOpenItems.includes(index)
                ? prevOpenItems.filter(itemIndex => itemIndex !== index)
                : [...prevOpenItems, index]
        );
    };

    return (
        // ✅ The container now uses Tailwind classes to match your original style
        <div className="relative overflow-hidden min-h-screen  bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-800  py-20">
            <Head>
                <title>FAQ & AI Help Center - FishChain</title>
                <meta name="description" content="Get instant answers to your FishChain questions with our AI-powered FAQ." />
            </Head>

            <div className="mt-screen  max-w-4xl mx-auto my-12 p-8 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-xl text-center">

                {/* Page Header - Styled to match your original design */}
                <h1 className="text-5xl font-bold text-blue-800 dark:text-blue-300 mb-2.5">
                    FishChain AI Help Center
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Ask us anything about our fish, traceability, delivery, or services!
                </p>

                {/* AI Question Form */}
                <form onSubmit={handleAiSubmit} className="flex flex-col items-center gap-5 mb-8">
                    <textarea
                        className="w-full p-4 text-base border border-gray-300 dark:border-gray-600 rounded-md resize-y min-h-[100px] dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        placeholder="e.g., 'How fresh is your fish?', 'What is blockchain traceability?'"
                        rows={4}
                    />

                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary rounded-xl text-white font-semibold text-base py-3 px-8 rounded-md transition-colors w-auto"
                    >
                        {loading ? 'Searching...' : 'Get Instant Answer'}
                    </Button>
                </form>

                {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

                {/* AI Answer Box - Styled to match your original design */}
                {aiAnswer && (
                    <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg text-left">
                        <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">Answer:</h3>
                        <p className="text-gray-800 dark:text-gray-200">{aiAnswer}</p>
                    </div>
                )}
            </div>
            
            {/* Pre-written FAQ Section - Now styled with Tailwind */}
            <div className="max-w-4xl mx-auto">
                 <h2 className="text-3xl font-bold text-center mb-8 text-white ">Frequently Asked Questions</h2>
                 <div className="space-y-4">
                     {faqs.map((faq, index) => (
                         <Collapsible
                             key={index}
                             open={openItems.includes(index)}
                             onOpenChange={() => toggleItem(index)}
                             className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden"
                         >
                             <CollapsibleTrigger asChild>
                                 <button className="flex justify-between items-center w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                     <span className="text-lg font-medium text-gray-800 dark:text-gray-200">{faq.question}</span>
                                     {openItems.includes(index) ? (
                                         <ChevronUp className="w-5 h-5 flex-shrink-0 text-gray-500" />
                                     ) : (
                                         <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-500" />
                                     )}
                                 </button>
                             </CollapsibleTrigger>
                             <CollapsibleContent className="px-6 pb-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                                 <p className="text-gray-600 dark:text-gray-300 pt-4 leading-relaxed">{faq.answer}</p>
                             </CollapsibleContent>
                         </Collapsible>
                     ))}
                 </div>
             </div>
        </div>
    );
}