// file: frontend/src/components/ProductCommentSection.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import io, { Socket } from 'socket.io-client';
import { ThumbsUp, Send } from 'lucide-react';
import TimeAgo from 'react-timeago';

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Reaction {
  [emoji: string]: string[];
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  replies: Comment[];
  reactions?: Reaction;
  parentId?: string | null;
}

// --- MAIN COMPONENT ---
export default function ProductCommentSection({ productId }: { productId: string }) {
    const { user, getAuthHeaders } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // --- DATA FETCHING & WEBSOCKETS ---
    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`${API}/api/comments/${productId}`);
                if (!response.ok) {
                    const text = await response.text();
                    console.error("Response error:", text);
                    throw new Error(`Failed to load comments: ${response.status} - ${text}`);
                }

                const json = await response.json();
                if (json.success && Array.isArray(json.data)) {
                    console.log("Fetched comments:", json.data); // DEBUG
                    setComments(json.data);
                } else {
                    console.warn("Unexpected data format", json);
                    setComments([]);
                }
            } catch (err: any) {
                console.error("Error fetching comments:", err);
                setError(err.message || "Unknown error");
                setComments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();

        // Websocket connection for real-time updates
        const newSocket = io(API);
        setSocket(newSocket);
        newSocket.emit('join_product_room', productId);

        const handleNewComment = (comment: Comment) => {
            setComments(prev => {
                if (comment.parentId) {
                    return prev.map(c => c.id === comment.parentId ? {...c, replies: [comment, ...c.replies]} : c);
                }
                return [comment, ...prev];
            });
        };

        const handleUpdate = (updatedComment: Comment) => {
             setComments(prev => prev.map(c => {
                if (c.id === updatedComment.id) return updatedComment;
                const replyIndex = c.replies.findIndex(r => r.id === updatedComment.id);
                if (replyIndex > -1) {
                    const newReplies = [...c.replies];
                    newReplies[replyIndex] = updatedComment;
                    return {...c, replies: newReplies};
                }
                return c;
            }));
        };

        const handleDelete = ({ commentId }: { commentId: string }) => {
            setComments(prev => prev.filter(c => c.id !== commentId).map(c => ({...c, replies: c.replies.filter(r => r.id !== commentId)})));
        };

        newSocket.on('new_comment', handleNewComment);
        newSocket.on('comment_updated', handleUpdate);
        newSocket.on('comment_deleted', handleDelete);

        return () => {
            newSocket.emit('leave_product_room', productId);
            newSocket.disconnect();
        };
    }, [productId, API]);

    const postComment = async (content: string, parentId: string | null = null) => {
        if (!content.trim() || !user) {
            alert('You must be logged in to comment.');
            return;
        }
        await fetch(`${API}/api/comments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ content, productId, parentId }),
        });
        // No optimistic update here; we let the websocket handle it for a single source of truth.
    };
    
    const toggleReaction = async (commentId: string, emoji: string) => {
        if (!user) { alert('You must be logged in to react.'); return; }
        await fetch(`${API}/api/comments/${commentId}/react`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ emoji }),
        });
    };

    const deleteComment = async (commentId: string) => {
        if(!confirm("Delete this comment? This cannot be undone.")) return;
        await fetch(`${API}/api/comments/${commentId}`, { method: 'DELETE', headers: getAuthHeaders() });
    };

    // --- RENDER LOGIC ---
    // The .reduce() call is now safe because it only runs when `comments` is a confirmed array.
    const totalComments = !loading && !error ? comments.reduce((acc, c) => acc + 1 + c.replies.length, 0) : 0;

    return (
        <div className="mt-16 w-full max-w-4xl mx-auto font-sans">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Discussion ({totalComments})</h2>
            
            {user ? (
                <div className="flex items-start space-x-4">
                    <Image src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name || '?'}`} alt="Your avatar" width={40} height={40} className="rounded-full flex-shrink-0"/>
                    <CommentForm onSubmit={(content, callback) => { postComment(content); callback(); }} />
                </div>
            ) : (
                <div className="p-4 text-center bg-gray-100 rounded-lg">You must be <a href="/signin" className="text-blue-600 font-semibold hover:underline">signed in</a> to comment.</div>
            )}
            
            <div className="mt-8 space-y-8">
                {loading && <p className="text-center text-gray-500">Loading comments...</p>}
                {error && <p className="text-center text-red-500">Error: {error}</p>}
                {!loading && !error && comments.map(comment => (
                    <CommentThread key={comment.id} comment={comment} onPostReply={postComment} onToggleReaction={toggleReaction} onDelete={deleteComment} currentUser={user}/>
                ))}
                {!loading && !error && comments.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Be the first to start the discussion!</p>
                )}
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS for a clean structure ---

function CommentThread({ comment, onPostReply, onToggleReaction, onDelete, currentUser }: any) {
    const [isReplying, setIsReplying] = useState(false);
    return (
        <div className="animate-fade-in">
            <CommentItem comment={comment} onReplyClick={() => setIsReplying(!isReplying)} onToggleReaction={onToggleReaction} onDelete={onDelete} currentUser={currentUser}/>
            {comment.replies.length > 0 && (
                <div className="ml-8 mt-4 pl-6 border-l-2 border-gray-200 space-y-4">
                    {comment.replies.map((reply: Comment) => (
                         <CommentItem key={reply.id} comment={reply} isReply={true} onReplyClick={() => setIsReplying(!isReplying)} onToggleReaction={onToggleReaction} onDelete={onDelete} currentUser={currentUser}/>
                    ))}
                </div>
            )}
            {isReplying && (
                <div className="ml-8 mt-4 pl-6 border-l-2 border-gray-200">
                    <div className="flex items-start space-x-4 pt-4">
                         <Image src={currentUser?.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${currentUser?.name || '?'}`} alt="Your avatar" width={32} height={32} className="rounded-full flex-shrink-0"/>
                         <CommentForm onSubmit={(content, callback) => { onPostReply(content, comment.id); setIsReplying(false); callback(); }} />
                    </div>
                </div>
            )}
        </div>
    );
}

function CommentItem({ comment, isReply = false, onReplyClick, onToggleReaction, onDelete, currentUser }: any) {
    const hasReacted = comment.reactions?.['👍']?.includes(currentUser?.id);
    return (
        <div className="flex items-start space-x-3">
            <Image src={comment.author.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${comment.author.name}`} alt={comment.author.name} width={isReply ? 32 : 40} height={isReply ? 32 : 40} className="rounded-full flex-shrink-0"/>
            <div className="flex-1">
                <div className="bg-gray-100 rounded-xl p-3">
                    <p className="font-semibold text-sm text-gray-800">{comment.author.name}</p>
                    <p className="text-gray-700">{comment.content}</p>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1 px-2">
                    <TimeAgo date={comment.createdAt} />
                    <button onClick={onReplyClick} className="font-semibold hover:underline">Reply</button>
                    <button onClick={() => onToggleReaction(comment.id, '👍')} className={`flex items-center font-semibold hover:underline ${hasReacted ? 'text-blue-600' : ''}`}>
                        <ThumbsUp className="w-4 h-4 mr-1"/> {comment.reactions?.['👍']?.length || 0}
                    </button>
                    {currentUser?.id === comment.author.id && (
                         <button onClick={() => onDelete(comment.id)} className="font-semibold text-red-500 hover:underline">Delete</button>
                    )}
                </div>
            </div>
        </div>
    );
}

function CommentForm({ onSubmit }: { onSubmit: (content: string, callback: () => void) => void }) {
    const [content, setContent] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(content, () => setContent('')); // Pass a callback to clear the input
    };
    return (
        <form onSubmit={handleSubmit} className="flex-1 flex items-center space-x-3">
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Add a public comment..." rows={1} className="w-full p-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
            <button type="submit" disabled={!content.trim()} className="p-3 bg-blue-600 text-white rounded-full disabled:bg-gray-300 hover:bg-blue-700 transition-colors">
                <Send className="w-5 h-5"/>
            </button>
        </form>
    );
}
