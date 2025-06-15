/* eslint-disable react-hooks/exhaustive-deps */
// frontend/src/app/dashboard/messages/page.tsx
'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Paperclip, Send, Smile, X, File as FileIcon, Check, CheckCheck, MessageSquareQuote, Mic, Trash2 } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface User {
  id: string;
  name: string;
  avatarUrl?: string; // Optional, for Dicebear or similar
}
interface Reaction {
  [emoji: string]: string[]; // e.g., { '❤️': ['user1_id', 'user2_id'] }
}
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  fileUrl?: string | null;
  fileType?: string;
  fileName?: string;
  reactions?: Reaction;
  status?: 'sending' | 'sent' | 'failed';
}

// Props for UserListItem
interface UserListItemProps {
  user: User;
  isOnline: boolean;
  isSelected: boolean;
  onClick: () => void;
}

// Props for MessageBubble
interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onReact: (messageId: string, emoji: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  currentUserId: string;
}

// Props for ChatInput
interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (audioFile: File | null) => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  attachedFile: File | null;
  filePreview: string | null;
  setAttachedFile: React.Dispatch<React.SetStateAction<File | null>>;
  setFilePreview: React.Dispatch<React.SetStateAction<string | null>>;
  showEmojiPicker: boolean;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
  onEmojiClick: (emojiData: EmojiClickData) => void;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  recordingTime: number;
  setRecordingTime: React.Dispatch<React.SetStateAction<number>>;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  timerIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

// --- HELPER FUNCTION ---
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve((reader.result as string).split(',')[1]);
  reader.onerror = error => reject(error);
});

// --- MAIN COMPONENT ---
export default function MessagesPage() {
  const { user } = useAuth();
  const userId = user?.id;

  // --- STATE MANAGEMENT ---
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]); // Explicitly typed as string[]
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);

  // UI & Form State
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState('');
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Message State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const { getAuthHeaders } = useAuth();

  // --- DATA FETCHING & WEBSOCKETS ---
  useEffect(() => {
    if (!userId) return;
    const newSocket = io(API, { query: { userId } });
    setSocket(newSocket);

    // Type the parameter onlineUserIds as string[]
    newSocket.on('update_online_users', (onlineUserIds: string[]) => setOnlineUsers(onlineUserIds));

    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.senderId === selectedUser?.id || (newMessage.senderId === userId && newMessage.receiverId === selectedUser?.id)) {
        // Type `prev` explicitly as Message[]
        setMessages((prev: Message[]) => {
          // This logic correctly replaces the temporary message with the real one from the server
          const existingMsgIndex = prev.findIndex(m => m.status === 'sending' && m.createdAt === newMessage.createdAt);
          if (existingMsgIndex !== -1) {
            const updatedMessages = [...prev];
            updatedMessages[existingMsgIndex] = { ...newMessage, status: 'sent' };
            return updatedMessages;
          }
          // Avoid adding duplicates if message already exists
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        // If the new message is from the other user, generate smart replies
        if (newMessage.senderId === selectedUser?.id) {
          fetchSmartReplies(newMessage.content);
        }
      }
    };

    const handleNewReaction = ({ messageId, reactions }: { messageId: string, reactions: Reaction }) => {
      setMessages((prev: Message[]) => prev.map(msg => msg.id === messageId ? { ...msg, reactions } : msg));
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev: Message[]) => prev.filter(m => m.id !== messageId));
    };

    newSocket.on('receive_message', handleNewMessage);
    newSocket.on('receive_reaction', handleNewReaction);
    newSocket.on('message_deleted', handleMessageDeleted);

    return () => {
      newSocket.off('receive_message', handleNewMessage);
      newSocket.off('receive_reaction', handleNewReaction);
      newSocket.off('message_deleted', handleMessageDeleted);
      newSocket.disconnect();
    };
  }, [userId, selectedUser?.id, API]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchConversation = async () => {
      try {
        const res = await fetch(`${API}/api/messages/conversations/${selectedUser.id}`, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }

        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          setMessages(result.data.map((m: Message) => ({ ...m, status: 'sent' })));
        } else {
          throw new Error(result.message || 'Failed to load conversation');
        }
      } catch (err) {
        console.error("Failed to fetch conversation:", err);
      }
    };

    fetchConversation();
    setSmartReplies([]);
  }, [selectedUser, API, getAuthHeaders]);

  useEffect(() => {
    if (!userId) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUserError('');

      try {
        const response = await fetch(`${API}/api/users`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
        const userList: User[] = result.data && Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

        setUsers(
          userList
            .filter((u: User) => u.id !== userId)
            .map((u: User) => ({
              ...u,
              avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${u.name}`,
            }))
        );
      } catch (err) {
        console.error('Failed to fetch or process users:', err);
        setUserError('Could not load users.');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [userId, API, getAuthHeaders]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- HANDLER FUNCTIONS ---
  const fetchSmartReplies = async (lastMessageContent: string) => {
    if (!lastMessageContent.trim()) {
      setSmartReplies([]);
      return;
    }

    try {
      const res = await fetch(`${API}/api/ai/generate-smart-replies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ lastMessageContent }),
      });

      const data = await res.json();
      if (data.replies) {
        setSmartReplies(data.replies);
      }
    } catch (err) {
      console.error("Failed to fetch smart replies:", err);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    setTimeout(() => {
      const sendButton = document.getElementById('send-message-button');
      sendButton?.click();
    }, 0);
  };

  const handleSendMessage = async (audioFile: File | null = null) => {
    const fileToSend = audioFile || attachedFile;
    const textToSend = input.trim();

    if ((!textToSend && !fileToSend) || !selectedUser || !socket || !userId) {
      return;
    }

    const tempId = `temp_${Date.now()}`;
    const tempCreatedAt = new Date().toISOString();
    const tempFilePreview = audioFile ? URL.createObjectURL(audioFile) : filePreview;

    const optimisticMessage: Message = {
      id: tempId,
      senderId: userId,
      receiverId: selectedUser.id,
      content: textToSend,
      createdAt: tempCreatedAt,
      read: true,
      fileUrl: tempFilePreview,
      fileType: fileToSend?.type,
      fileName: fileToSend?.name,
      reactions: {},
      status: 'sending',
    };

    setMessages((prev: Message[]) => [...prev, optimisticMessage]);

    const fileData = fileToSend ? await toBase64(fileToSend) : null;

    const messageForBackend = {
      senderId: userId,
      receiverId: selectedUser.id,
      content: textToSend,
      createdAt: tempCreatedAt, // Send timestamp to match later
      fileData,
      fileName: fileToSend?.name,
      fileType: fileToSend?.type,
    };

    setInput('');
    setAttachedFile(null);
    setFilePreview(null);
    setSmartReplies([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    socket.emit('send_message', messageForBackend, (response: Message & { error?: string }) => {
      if (response.error) {
        setMessages((prev: Message[]) => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
      } else {
        setMessages((prev: Message[]) => prev.map(m => m.id === tempId ? { ...response, status: 'sent' } : m));
      }
    });
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (messageId.startsWith('temp_') || !confirm('Delete this message?')) {
      return;
    }

    setMessages((prev: Message[]) => prev.filter(m => m.id !== messageId));

    try {
      await fetch(`${API}/api/messages/conversations/${messageId}`, { method: 'DELETE', headers: getAuthHeaders() });
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!socket || !userId || messageId.startsWith('temp_')) {
      return;
    }

    setMessages((prev: Message[]) => prev.map(msg => {
      if (msg.id !== messageId) {
        return msg;
      }

      const newReactions = JSON.parse(JSON.stringify(msg.reactions || {}));
      if (!newReactions[emoji]) {
        newReactions[emoji] = [];
      }

      const userHasReacted = newReactions[emoji].includes(userId);
      if (userHasReacted) {
        newReactions[emoji] = newReactions[emoji].filter((id: string) => id !== userId);
        if (newReactions[emoji].length === 0) {
          delete newReactions[emoji];
        }
      } else {
        newReactions[emoji].push(userId);
      }

      return { ...msg, reactions: newReactions };
    }));

    socket.emit('send_reaction', { messageId, emoji, userId });
  };

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await fetch(`${API}/api/messages/conversations/${messageId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      setMessages((prev: Message[]) => prev.map(m => (m.id === messageId ? { ...m, read: true } : m)));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, [API, getAuthHeaders]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setInput((prev: string) => prev + emojiData.emoji);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setAttachedFile(file);
      setFilePreview(file.type.startsWith('image/') || file.type.startsWith('video/') ? URL.createObjectURL(file) : 'file');
    }
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      <aside className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <header className="p-4 border-b border-gray-200"><h1 className="text-2xl font-bold">Chats</h1></header>
        <div className="flex-grow overflow-y-auto">
          {loadingUsers && <div className="p-4 text-center text-gray-500">Loading Users...</div>}
          {userError && <div className="p-4 text-center text-red-500">{userError}</div>}
          {!loadingUsers && !userError && users.length === 0 && <div className="p-4 text-center text-gray-500">No other users found.</div>}
          {!loadingUsers && !userError && users.map(u => (
            <UserListItem
              key={u.id}
              user={u}
              isOnline={onlineUsers.includes(u.id)}
              isSelected={selectedUser?.id === u.id}
              onClick={() => setSelectedUser(u)}
            />
          ))}
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        {!selectedUser ? (
          <div className="flex-grow flex items-center justify-center bg-slate-50">
            <div className="text-center text-gray-500">
              <MessageSquareQuote size={64} className="mx-auto text-gray-300"/>
              <h2 className="text-2xl mt-4 font-semibold">Welcome to FishChain Chat</h2>
              <p>Select a user from the left to start a conversation.</p>
            </div>
          </div>
        ) : (
          <>
            <header className="flex items-center p-3 border-b border-gray-200 bg-white shadow-sm">
              <Image src="/public/images/profile.jpeg" alt={selectedUser.name} width={40} height={40} className="rounded-full" />
              <div className="ml-3">
                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                <p className={`text-sm ${onlineUsers.includes(selectedUser.id) ? 'text-green-600' : 'text-gray-500'}`}>{onlineUsers.includes(selectedUser.id) ? 'Online' : 'Offline'}</p>
              </div>
            </header>
            <div className="flex-grow p-4 overflow-y-auto bg-slate-100" style={{ backgroundImage: "url('/chat-bg.png')", backgroundSize: "contain" }}>
              <div className="space-y-1">
                {messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwnMessage={msg.senderId === userId}
                    onReact={handleReaction}
                    onMarkAsRead={markAsRead}
                    onDelete={handleDeleteMessage}
                    currentUserId={userId!}
                  />
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>
            <footer className="p-2 sm:p-4 bg-white border-t border-gray-200">
              {smartReplies.length > 0 && (
                <div className="flex gap-2 mb-2 animate-fade-in-up">
                  {smartReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-1.5 text-sm bg-primary text-primary rounded-full hover:bg-primary transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
              <ChatInput
                input={input}
                setInput={setInput}
                handleSendMessage={handleSendMessage}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                attachedFile={attachedFile}
                filePreview={filePreview}
                setAttachedFile={setAttachedFile}
                setFilePreview={setFilePreview}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                onEmojiClick={onEmojiClick}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                recordingTime={recordingTime}
                setRecordingTime={setRecordingTime}
                mediaRecorderRef={mediaRecorderRef}
                timerIntervalRef={timerIntervalRef}
              />
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function UserListItem({ user, isOnline, isSelected, onClick }: UserListItemProps) {
  return (
    <div onClick={onClick} className={`flex items-center p-3 cursor-pointer transition-colors ${isSelected ? 'bg-primary' : 'hover:bg-gray-100'}`}>
      <div className="relative">
        {/* Consider using user.avatarUrl if available, otherwise fallback to Dicebear */}
        <Image
          src={user.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`}
          alt={user.name}
          width={48}
          height={48}
          className="rounded-full"
          unoptimized // Important for Dicebear SVGs in Next.js
        />
        <span className={`absolute bottom-0 right-0 block h-3.5 w-3.5 border-2 border-white rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <p className="font-semibold truncate">{user.name}</p>
        <p className="text-sm text-gray-500 truncate">Last message...</p>
      </div>
    </div>
  );
}

function MessageBubble({ message, isOwnMessage, onReact, onMarkAsRead, onDelete, currentUserId }: MessageBubbleProps) {
  const msgRef = useRef<HTMLDivElement>(null);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (!msgRef.current || isOwnMessage || message.read || message.status !== 'sent') return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onMarkAsRead(message.id);
        observer.disconnect();
      }
    }, { threshold: 0.8 });

    observer.observe(msgRef.current);

    return () => observer.disconnect();
  }, [message.id, isOwnMessage, message.read, message.status, onMarkAsRead]);

  return (
    <div ref={msgRef} onMouseEnter={() => setShowActions(true)} onMouseLeave={() => setShowActions(false)} className={`group flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-center transition-opacity duration-200 ${isOwnMessage ? 'order-1' : 'order-2'} ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {isOwnMessage && message.status === 'sent' && (
          <button
            onClick={() => onDelete(message.id)}
            className="p-1.5 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600"
            title="Delete message"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        {message.status === 'sent' && (
          <button
            onClick={() => onReact(message.id, '👍')}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500"
            title="React"
          >
            <Smile className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className={`relative max-w-xs md:max-w-md lg:max-w-lg p-1 ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div className={`px-3 py-2 rounded-2xl shadow-sm ${isOwnMessage ? 'bg-primary text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
          {message.fileUrl && (
            <div className="mb-2 bg-black/10 rounded-lg overflow-hidden">
              {message.fileType?.startsWith('image/') ? (
                <Image
                  src={message.fileUrl}
                  alt={message.fileName || "sent image"}
                  width={250}
                  height={250}
                  className="w-full h-auto object-cover cursor-pointer"
                  onClick={() => window.open(message.fileUrl as string, '_blank')}
                  unoptimized
                />
              ) : message.fileType?.startsWith('audio/') ? (
                <audio controls src={message.fileUrl} className="w-full h-12" />
              ) : (
                <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 hover:bg-black/10">
                  <FileIcon className={`h-8 w-8 mr-3 flex-shrink-0 ${isOwnMessage ? 'text-white' : 'text-gray-500'}`} />
                  <span className="text-sm truncate">{message.fileName || 'Download File'}</span>
                </a>
              )}
            </div>
          )}
          {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
          <div className="text-xs mt-1 flex justify-end items-center gap-1 opacity-75">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {isOwnMessage && (
              message.status === 'sent' ? (
                <CheckCheck size={16} className={message.read ? 'text-sky-400' : ''} />
              ) : message.status === 'sending' ? (
                <Check size={16} />
              ) : message.status === 'failed' ? (
                <X size={16} className="text-red-400" />
              ) : null
            )}
          </div>
        </div>
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 px-1">
            {Object.entries(message.reactions).map(([emoji, userIds]: [string, string[]]) =>
              userIds.length > 0 && (
                <span
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  className={`text-xs px-2 py-0.5 rounded-full cursor-pointer flex items-center shadow-sm ${userIds.includes(currentUserId) ? 'bg-primary border border-primary' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {emoji}{' '}
                  <span className="text-xxs ml-1 font-semibold">{userIds.length}</span>
                </span>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatInput({ input, setInput, handleSendMessage, fileInputRef, handleFileChange, attachedFile, filePreview, setAttachedFile, setFilePreview, showEmojiPicker, setShowEmojiPicker, onEmojiClick, isRecording, setIsRecording, recordingTime, setRecordingTime, mediaRecorderRef, timerIntervalRef }: ChatInputProps) {
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      const audioChunks: Blob[] = [];
      recorder.ondataavailable = (event: BlobEvent) => {
        audioChunks.push(event.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
        handleSendMessage(audioFile);
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      };
      recorder.start();
      setIsRecording(true);
      timerIntervalRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } catch (err) {
      alert("Microphone access was denied. Please enable it in your browser settings.");
    }
  };

  const stopRecording = (send: boolean) => {
    if (mediaRecorderRef.current) {
      if (send) mediaRecorderRef.current.stop();
      else mediaRecorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  };





    return (
        <div>
            {attachedFile && (<div className="relative w-fit p-2 mb-2 bg-gray-200 rounded-lg"><button onClick={() => { setAttachedFile(null); setFilePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"><X className="h-4 w-4" /></button>{filePreview === 'file' ? (<div className="flex items-center"><FileIcon className="h-6 w-6 mr-2" /><span className="text-sm">{attachedFile.name}</span></div>) : (<Image src={filePreview!} alt="preview" width={80} height={80} className="rounded-md" />)}</div>)}
            <div className="relative flex items-center">
                {isRecording ? (
                    <div className="w-full flex items-center justify-between bg-gray-100 rounded-full p-2 animate-fade-in">
                        <button onClick={() => stopRecording(false)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Cancel Recording"><Trash2 className="h-5 w-5"/></button>
                        <div className="flex items-center font-mono text-red-500"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div><span>{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span></div>
                        <button onClick={() => stopRecording(true)} className="p-3 text-white bg-primary rounded-full hover:bg-primary" title="Send Voice Message"><Send className="h-5 w-5"/></button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center"><button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-primary" title="Attach File"><Paperclip className="h-5 w-5"/></button><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,audio/*,video/*"/><button onClick={() => setShowEmojiPicker((p: boolean) => !p)} className="p-2 text-gray-500 hover:text-primary" title="Add Emoji"><Smile className="h-5 w-5"/></button></div> {/* Type p */}
                        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(null); }}} placeholder="Type a message..." rows={1} className="flex-grow p-2 pl-4 text-base bg-gray-100 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
                        <div className="flex items-center ml-2">{input.trim() || attachedFile ? (<button id="send-message-button" onClick={() => handleSendMessage(null)} className="p-3 text-white bg-primary rounded-full hover:bg-primary transition-colors flex-shrink-0" title="Send Message"><Send className="h-5 w-5"/></button>) : (<button onClick={startRecording} className="p-3 text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors flex-shrink-0" title="Record Voice Message"><Mic className="h-5 w-5"/></button>)}</div>
                    </>
                )}
                {showEmojiPicker && (<div className="absolute bottom-full mb-2 z-10"><EmojiPicker onEmojiClick={onEmojiClick} theme={'light' as Theme} /></div>)}
            </div>
        </div>
    )
}