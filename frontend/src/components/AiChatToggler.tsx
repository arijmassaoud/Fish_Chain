'use client';
import React, { useState } from 'react';
import AiChat from './AiChat';
import { BotMessageSquare } from 'lucide-react';

export default function AiChatToggler() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary transition"
          aria-label="Open AI Chat"
        >
          <BotMessageSquare />
        </button>
      )}

      {isOpen && <AiChat />}
    </>
  );
}