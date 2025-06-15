'use client';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from './UI/button';
import { BotMessageSquare, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// NEW: This type now matches the format our Gemini backend expects for history.
interface ChatPart {
  role: 'user' | 'model'; // 'model' is the Gemini equivalent of 'assistant'
  parts: { text: string }[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant'; // We still use 'assistant' for UI rendering
  content: string;
}

interface Tool {
  name: string;
  description: string;
  execute: (args: any) => Promise<string>;
}

// No changes needed in the TOOLS definition, it's well-structured.
const TOOLS: Record<string, Tool> = {
  '/getProductDetails': {
    name: '/getProductDetails',
    description: 'Get details about a specific product by ID.',
    execute: async (args: { productId: string }) => {
      try {
        if (!args.productId) return 'Error: You must provide a productId. Usage: `/getProductDetails productId=...`';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${args.productId}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        return `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
      } catch (err: any) {
        return `Error: ${err.message}`;
      }
    },
  },
  '/deleteProduct': {
    name: '/deleteProduct',
    description: 'Delete a product by ID.',
    execute: async (args: { productId: string }) => {
      try {
        if (!args.productId) return 'Error: You must provide a productId. Usage: `/deleteProduct productId=...`';
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${args.productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token || ''}`,
          },
        });
        if (!res.ok) throw new Error('Failed to delete product. You may not have permission.');
        return `Product ${args.productId} deleted successfully.`;
      } catch (err: any) {
        return `Error: ${err.message}`;
      }
    },
  },
  '/listProducts': {
    name: '/listProducts',
    description: 'List all available products.',
    execute: async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        if (data.length === 0) return 'No products found.';
        return 'Available Products:\n' + data.map((p: any) => `- ${p.name} (ID: ${p.id})`).join('\n');
      } catch (err: any) {
        return `Error: ${err.message}`;
      }
    },
  },
  '/help': {
    name: '/help',
    description: 'Show help instructions.',
    execute: async () => {
      return `
### Available Tools
- \`/getProductDetails productId=...\` – Get full info about a product
- \`/deleteProduct productId=...\` – Delete a product
- \`/listProducts\` – Show all product names and IDs
- \`/help\` – Show this list
`;
    },
  },
};

const SESSION_STORAGE_KEY = 'ai-chat-messages';

export default function AiChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FIX 1: Hooks were outside the component body. They must be inside.
  // This 'debouncedInput' was also unused, so I've removed it for clarity.

  // FIX 2: getSystemPrompt was unused. It's better to pass the role directly to the backend.
  // The backend now handles the system prompt based on the user's role.

  // Load saved messages from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse chat history', e);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } else {
        // Initial welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hello! I'm your AI assistant. How can I help you today?\n\nType \`/help\` to see a list of available commands.`,
          },
        ]);
    }
  }, []);

  // Save messages to session storage whenever they change
  useEffect(() => {
    // Avoid saving the initial blank state
    if (messages.length > 0) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // NEW 3: Handle client-side tools before sending to AI
      if (trimmedInput.startsWith('/')) {
        const [command, ...argsParts] = trimmedInput.split(' ');
        const tool = TOOLS[command];
        
        if (tool) {
          const args = Object.fromEntries(
            argsParts.map(part => part.split('='))
          );
          const result = await tool.execute(args);
          const toolMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: result,
          };
          setMessages((prev) => [...prev, toolMessage]);
        } else {
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Unknown command: "${command}". Type \`/help\` to see available commands.`,
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } else {
        // FIX 4: Aligned fetch request with the new backend API format
        
        // Convert our UI messages to the format the Gemini API history expects
        const history: ChatPart[] = messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            history: history,    // Send the conversation history
            message: trimmedInput, // Send the new message separately
          }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'The server responded with an error.');
        }

        const data = await response.json();
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.content || 'I received an empty response.',
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, something went wrong: ${err.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // No changes needed in the JSX, it's well-structured.
    <div className="fixed bottom-4 right-4 z-50">
      {/* ... your existing JSX for the button and chat window ... */}
        {/* The provided JSX is good, so I will omit it for brevity, you can keep yours */}
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary transition-transform transform hover:scale-110"
         >
            {isOpen ? <X size={24} /> : <BotMessageSquare size={24} />}
         </button>

         {isOpen && (
           <div className="bg-white w-[400px] h-[600px] border border-gray-300 rounded-lg shadow-xl flex flex-col absolute bottom-full right-0 mb-2">
             <div className="p-4 bg-primary text-white font-bold flex justify-between items-center rounded-t-lg">
               <span>AI Assistant</span>
               <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                 <X size={20} />
               </button>
             </div>
             <div className="flex-grow overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
               {messages.map((msg) => (
                 <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {msg.role === 'assistant' && <BotMessageSquare className="w-6 h-6 text-primary flex-shrink-0" />}
                   <div className={`inline-block max-w-xs px-4 py-2 rounded-lg shadow-md ${
                       msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-black rounded-bl-none'
                     }`}
                   >
                     <ReactMarkdown >{msg.content}</ReactMarkdown>
                   </div>
                 </div>
               ))}
                {loading && (
                    <div className="flex items-end gap-2 justify-start">
                        <BotMessageSquare className="w-6 h-6 text-primary flex-shrink-0" />
                        <div className="inline-block max-w-xs px-4 py-2 rounded-lg shadow-md bg-gray-200 text-black rounded-bl-none">
                            <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
             </div>
             <form onSubmit={handleSubmit} className="border-t p-4 bg-gray-50">
               <div className="flex items-center gap-2">
                 <input
                   type="text"
                   value={input}
                   onChange={handleInputChange}
                   placeholder="Ask something or type /help"
                   className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-secondary"
                   disabled={loading}
                 />
                 <Button type="submit" disabled={loading || !input.trim()} className="bg-primary hover:bg-primary disabled:bg-primary">
                   Send
                 </Button>
               </div>
             </form>
           </div>
         )}
    </div>
  );
}