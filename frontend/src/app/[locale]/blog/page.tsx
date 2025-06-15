'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Sparkles, Rss, RefreshCw, PlusCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NewsItem {
    title: string;
    summary: string;
}

export default function BlogPage() {
    const { user, loading: authLoading } = useAuth();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);
    const [errorNews, setErrorNews] = useState('');
    const [generatingPost, setGeneratingPost] = useState(false);
    const [generatedPostContent, setGeneratedPostContent] = useState('');
    const [blogTopic, setBlogTopic] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchNewsTopics = async () => {
            setLoadingNews(true);
            setErrorNews('');
            try {
                const response = await fetch(`${API_URL}/api/ai/generate-news-topics`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch news topics: ${response.statusText}`);
                }
                const data = await response.json();
                setNews(Array.isArray(data.news) ? data.news : []);
            } catch (err: any) {
                console.error("Error fetching news topics:", err);
                setErrorNews(err.message || "Could not fetch news topics.");
            } finally {
                setLoadingNews(false);
            }
        };

        fetchNewsTopics();
    }, [API_URL]);

    const handleGenerateBlogPost = async () => {
        if (!blogTopic.trim()) {
            alert('Please enter a topic for the blog post.');
            return;
        }
        setGeneratingPost(true);
        setGeneratedPostContent('');
        try {
            const response = await fetch(`${API_URL}/api/ai/generate-blog-post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: blogTopic }),
            });
            if (!response.ok) {
                throw new Error(`Failed to generate blog post: ${response.statusText}`);
            }
            const data = await response.json();
            setGeneratedPostContent(data.content);
        } catch (err: any) {
            console.error("Error generating blog post:", err);
            setGeneratedPostContent(`Error generating post: ${err.message}`);
        } finally {
            setGeneratingPost(false);
        }
    };

    const canCreateBlog = user && (user.role === 'ADMIN' || user.role === 'SELLER');

    return (
        <>
            <Head>
                <title>FishChain Blog - News & Insights</title>
                <meta name="description" content="Stay updated with the latest news and insights from FishChain about fresh fish, aquaculture, and Tunisian seafood." />
            </Head>

            {/* STYLE: Use a light background for a clean, modern feel */}
            <div className="relative overflow-hidden min-h-screen  bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-800   flex items-center justify-center pt-20">
                {/* STYLE: Centered container for content with ample padding */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center">
                                <Rss className="mr-3 h-10 w-10 text-blue-600" />
                                FishChain Blog & News
                            </h1>
                            <p className="mt-2 text-lg text-white">
                                Your source for fresh insights into the world of fish and seafood.
                            </p>
                        </div>
                        {authLoading ? (
                            <div className="text-slate-500 text-sm mt-4 sm:mt-0">Checking permissions...</div>
                        ) : canCreateBlog && (
                            <Link href="/blog/new" passHref>
                                <button className="mt-4 sm:mt-0 px-5 py-2.5 bg-primary hover:bg-blue text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    <PlusCircle className="mr-2 h-5 w-5" />
                                    Create New Post
                                </button>
                            </Link>
                        )}
                    </div>

                    {/* NEW: Main content grid with a sidebar */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* Main Content Column */}
                        <main className="lg:col-span-2 space-y-12">
                            
                            {/* Section: Our Latest Articles */}
                            <section>
                                <h2 className="text-3xl font-bold text-white mb-6">Our Latest Articles</h2>
                                {/* STYLE: Enhanced article list with a card-based design */}
                                <div className="space-y-8">
                                    {/* Placeholder Article 1 */}
                                    <article className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                                        <h3 className="text-2xl font-semibold text-slate-900">
                                            <Link href="#" className="hover:text-blue-600">Seasonal Fish in Kairouan: What's Fresh Now?</Link>
                                        </h3>
                                        <p className="mt-2 text-slate-600">Discover the freshest catches available this season directly from the waters of Kairouan. We dive into the types of fish you can expect and how to best prepare them.</p>
                                        <Link href="#" className="inline-flex items-center mt-4 font-semibold text-blue-600 hover:text-blue-800">
                                            Read More <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </article>
                                    {/* Placeholder Article 2 */}
                                     <article className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                                        <h3 className="text-2xl font-semibold text-slate-900">
                                            <Link href="#" className="hover:text-blue-600">The Health Benefits of Omega-3s from Tunisian Sardines</Link>
                                        </h3>
                                        <p className="mt-2 text-slate-600">Tunisian sardines are not only delicious but also packed with essential Omega-3 fatty acids. Learn about the incredible health benefits and why you should add them to your diet.</p>
                                        <Link href="#" className="inline-flex items-center mt-4 font-semibold text-blue-600 hover:text-blue-800">
                                            Read More <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </article>
                                </div>
                            </section>
                            
                            {/* Section: AI Blog Post Generator */}
                            <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center mb-1">
                                    <Sparkles className="mr-3 h-7 w-7 text-violet-500" />
                                    Create with AI
                                </h2>
                                <p className="text-slate-600 mb-6">Need an idea? Enter a topic and let our AI craft a unique post for you.</p>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <input
                                        type="text"
                                        value={blogTopic}
                                        onChange={(e) => setBlogTopic(e.target.value)}
                                        placeholder="e.g., 'Sustainable fishing in Tunisia'"
                                        className="flex-grow w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        disabled={generatingPost}
                                    />
                                    <button
                                        onClick={handleGenerateBlogPost}
                                        className="w-full sm:w-auto px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
                                        disabled={generatingPost || !blogTopic.trim()}
                                    >
                                        {generatingPost ? (
                                            <>
                                                <RefreshCw className="animate-spin mr-2" size={20} /> Generating...
                                            </>
                                        ) : 'Generate Post'}
                                    </button>
                                </div>
                                {generatedPostContent && (
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-6">
                                        <h3 className="text-xl font-semibold text-slate-800 mb-3">Your AI-Generated Draft:</h3>
                                        <div
                                            className="prose prose-slate max-w-none"
                                            dangerouslySetInnerHTML={{ __html: generatedPostContent.replace(/\n/g, '<br/>') }}
                                        />
                                    </div>
                                )}
                            </section>

                        </main>

                        {/* Sidebar Column */}
                        <aside className="lg:col-span-1 space-y-12">
                            {/* Section: AI-Powered News */}
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                                    <Sparkles className="mr-2 text-amber-500" />
                                    Trending Topics
                                </h2>
                                {loadingNews ? (
                                    <p className="text-slate-600">Loading latest topics...</p>
                                ) : errorNews ? (
                                    <p className="text-red-500">Error: {errorNews}</p>
                                ) : news.length > 0 ? (
                                    <div className="space-y-4">
                                        {news.map((item, index) => (
                                            <div key={index} className="border-b border-slate-200 pb-3 last:border-b-0">
                                                <h3 className="font-semibold text-blue-700">{item.title}</h3>
                                                <p className="text-slate-600 text-sm mt-1">{item.summary}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-600">No news topics available.</p>
                                )}
                            </section>
                        </aside>

                    </div>
                </div>
            </div>
        </>
    );
}