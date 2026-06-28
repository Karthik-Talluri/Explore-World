'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MessageSquare, X, Send, Compass, ArrowRight, Palmtree } from 'lucide-react';
import AuthModal from './AuthModal';
import CheckoutModal from './CheckoutModal';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  packages?: any[];
}

export default function AIAssistant() {
  const { apiUrl, token, setActiveBooking } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Welcome to **Explore World**! I am your AI Travel Assistant. I specialize in finding the best national and international tour packages. Tell me: *'I want to plan a honeymoon to Maldives'* or *'Show me adventure packages in Kashmir'*!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI processing failed');

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply,
          packages: data.packages,
        },
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: "I'm sorry, I'm having trouble connecting to the travel planner right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookPackage = (pkg: any) => {
    if (!token) {
      setIsAuthOpen(true);
      return;
    }
    setActiveBooking({
      packageId: pkg.id,
      name: pkg.name,
      price: pkg.price * 85, // Converted to INR
      availableDates: pkg.availableDates,
    });
    setIsCheckoutOpen(true);
  };

  const renderMessageText = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      const parts = paragraph.split('**');
      return (
        <p key={index} className="mb-2 last:mb-0 leading-relaxed text-xs sm:text-sm">
          {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-bold text-foreground">{part}</strong> : part))}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-gradient-to-r from-secondary to-amber-600 p-4 text-slate-950 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="AI Travel Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6 animate-pulse" />}
      </button>

      {/* Slide-out Sidebar Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-card border-l border-border shadow-2xl flex flex-col transition-all duration-300 animate-fade-in">
          
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4 bg-background">
            <div className="flex items-center space-x-2">
              <Compass className="h-5 w-5 text-secondary animate-spin-slow" />
              <div>
                <h3 className="text-sm font-bold text-foreground">AI Travel Assistant</h3>
                <span className="text-2xs text-emerald-500 font-semibold">● Online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Text Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {renderMessageText(msg.text)}
                </div>

                {/* Recommendations */}
                {msg.sender === 'ai' && msg.packages && msg.packages.length > 0 && (
                  <div className="w-full mt-3 space-y-3 pl-2">
                    {msg.packages.map((pkg, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-secondary/20 bg-background overflow-hidden shadow-sm hover:border-secondary/50 transition-colors"
                      >
                        {pkg.images && pkg.images[0] && (
                          <img
                            src={pkg.images[0]}
                            alt={pkg.name}
                            className="h-24 w-full object-cover"
                          />
                        )}
                        <div className="p-2.5 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold block text-foreground truncate max-w-44">
                              {pkg.name}
                            </span>
                            <span className="text-2xs text-muted-foreground">{pkg.destination} • {pkg.durationDays} Days</span>
                          </div>
                          <button
                            onClick={() => handleBookPackage(pkg)}
                            className="flex items-center space-x-1 rounded-lg bg-secondary/15 hover:bg-secondary/25 px-2 py-1 text-2xs font-bold text-secondary transition-all"
                          >
                            <span>₹{(pkg.price * 85).toLocaleString('en-IN')}</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2 bg-muted rounded-2xl px-4 py-2.5 w-24">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Input Footer Form */}
          <form onSubmit={handleSend} className="h-16 border-t border-border p-3 flex space-x-2 bg-background">
            <input
              type="text"
              placeholder="Ask for holiday planning..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 rounded-xl border border-input bg-muted/30 px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-secondary"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-secondary p-2 text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onSuccess={() => {}} />
    </>
  );
}
