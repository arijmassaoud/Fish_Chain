'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Sparkles, Send, RefreshCw, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateBlogPostPage() {
    const { user, getAuthHeaders, loading: authLoading } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [generatedPrompts, setGeneratedPrompts] = useState([]);
    const [loadingPrompts, setLoadingPrompts] = useState(false);
    const [errorPrompts, setErrorPrompts] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Placeholder function for copying text to the clipboard
    // In modern browsers, navigator.clipboard is preferred but can require a secure context (HTTPS).
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            // Optional: Show a "Copied!" feedback message to the user
            alert('Prompt copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers or insecure contexts if needed
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Prompt copied to clipboard!');
            } catch (fallbackErr) {
                alert('Failed to copy prompt.');
            }
        });
    };
    
    // Authorization check
    if (authLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-slate-100 text-slate-700">Loading authentication...</div>;
    }
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SELLER')) { // Allow SELLERs too
        return <div className="flex justify-center items-center min-h-screen bg-slate-100 text-red-600">Access Denied. You do not have permission to create blog posts.</div>;
    }

    const handleGenerateImagePrompts = async () => {
        setErrorPrompts('');
        setGeneratedPrompts([]);
        if (!title.trim() || !content.trim()) {
            setErrorPrompts('Please provide a title and content before generating prompts.');
            return;
        }

        setLoadingPrompts(true);
        try {
            const headers = getAuthHeaders();
            const response = await fetch(`${API_URL}/api/ai/suggest-image-prompts`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ blogPostTitle: title, blogPostContent: content }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            setGeneratedPrompts(data.prompts || []);
        } catch (err) {
            console.error("Error generating image prompts:", err);
            setErrorPrompts(err.message || 'An unknown error occurred.');
        } finally {
            setLoadingPrompts(false);
        }
    };

    const handleSaveBlogPost = async () => {
        // Here you would implement your save logic
        alert('Blog post saved! (This is a placeholder action)');
        console.log({ title, content });
    };

    return (
        <>
            <Head>
                <title>Create New Post - FishChain Admin</title>
            </Head>
            {/* NEW: Use a light slate background for the whole page for a professional feel */}
            <div className="relative overflow-hidden min-h-screen  bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-800   flex items-center justify-center pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    
                    {/* Page Header */}
                    <div className="mb-8">
                        <Link href="/blog" className="flex items-center text-sm font-medium text-white hover:text-blue-600 transition-colors mb-4">
                           <ChevronLeft className="h-5 w-5 mr-1" />
                           Back to Blog
                        </Link>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
                            <FileText className="mr-3 h-8 w-8 text-blue-600" />
                            Create New Post
                        </h1>
                    </div>

                    {/* NEW: Two-column layout for editor and tools */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Main Content Editor Column */}
                        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="blogTitle" className="block text-lg font-semibold text-slate-800 mb-2">Title</label>
                                    <input
                                        type="text"
                                        id="blogTitle"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="block w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-lg"
                                        placeholder="e.g., The Secret to Fresh Tunisian Sardines"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="blogContent" className="block text-lg font-semibold text-slate-800 mb-2">Content</label>
                                    <textarea
                                        id="blogContent"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={16}
                                        className="block w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y leading-relaxed"
                                        placeholder="Start writing your amazing blog post here..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column for Tools & Actions */}
                        <div className="lg:col-span-1 space-y-8">
                            
                            {/* Publish Card */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                                <h2 className="text-xl font-bold text-slate-800 mb-4">Publish</h2>
                                <button
                                    onClick={handleSaveBlogPost}
                                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-primary hover:bg-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-60"
                                    disabled={!title.trim() || !content.trim()}
                                >
                                    <Send className="mr-2" size={20} /> Save Post
                                </button>
                                <p className="text-xs text-slate-500 mt-3 text-center">You can edit this post later.</p>
                            </div>

                            {/* AI Assistant Card */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center mb-2">
                                    <Sparkles className="mr-2 text-violet-500"/>
                                    AI Assistant
                                </h2>
                                <p className="text-sm text-slate-600 mb-4">
                                    Generate image ideas based on your title and content.
                                </p>
                                <button
                                    onClick={handleGenerateImagePrompts}
                                    className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
                                    disabled={loadingPrompts || !title.trim() || !content.trim()}
                                >
                                    {loadingPrompts ? (
                                        <>
                                            <RefreshCw className="animate-spin mr-2" size={18} /> Generating...
                                        </>
                                    ) : (
                                        'Generate Image Prompts'
                                    )}
                                </button>

                                {errorPrompts && (
                                    <div className="bg-red-50 text-red-700 p-3 rounded-md mt-4 text-sm">
                                        <strong>Error:</strong> {errorPrompts}
                                    </div>
                                )}

                                {generatedPrompts.length > 0 && (
                                    <div className="mt-6 space-y-3">
                                        <h3 className="text-md font-semibold text-slate-700">Suggestions:</h3>
                                        <ul className="space-y-2 text-sm text-slate-700">
                                            {generatedPrompts.map((prompt, index) => (
                                                <li key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors">
                                                    <p>{prompt}</p>
                                                    <button 
                                                        onClick={() => copyToClipboard(prompt)}
                                                        className="text-xs font-semibold text-blue-600 hover:underline mt-2"
                                                    >
                                                        Copy
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

