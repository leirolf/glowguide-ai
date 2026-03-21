import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  Palette, 
  User, 
  ChevronRight,
  Loader2,
  Heart,
  Info
} from 'lucide-react';
import { generatePalette, getChatResponse, PaletteResponse } from './services/geminiService';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SKIN_TONES = ['Fair', 'Medium', 'Morena', 'Deep'];
const OCCASIONS = [
  'School', 'Casual', 'Work', 'Date Night', 
  'Party', 'Wedding', 'Formal Event', 'Photoshoot'
];

export default function App() {
  const [skinTone, setSkinTone] = useState('');
  const [occasion, setOccasion] = useState('');
  const [customOccasion, setCustomOccasion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [palette, setPalette] = useState<PaletteResponse | null>(null);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Hello! I'm your GlowGuide AI assistant. How can I help you with your beauty routine today?" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleGenerate = async () => {
    const finalOccasion = customOccasion || occasion;
    if (!skinTone || !finalOccasion) return;

    setIsGenerating(true);
    try {
      const result = await generatePalette(skinTone, finalOccasion);
      setPalette(result);
    } catch (error) {
      console.error("Failed to generate palette:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const history = chatMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      const response = await getChatResponse(userMessage, history);
      setChatMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Oops! Something went wrong. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pb-20">
      {/* Header */}
      <header className="w-full max-w-4xl px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand-olive rounded-full flex items-center justify-center text-brand-cream shadow-lg">
              <Sparkles size={32} />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-medium text-brand-olive mb-2">GlowGuide AI</h1>
          <p className="text-stone-500 font-light tracking-wide italic">Your personal professional makeup artist</p>
        </motion.div>
      </header>

      <main className="w-full max-w-4xl px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Input Section */}
        <section className="md:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-stone-100">
            <h2 className="text-2xl font-serif mb-6 flex items-center gap-2">
              <User size={20} className="text-brand-olive" />
              Your Profile
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400 mb-3">Skin Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {SKIN_TONES.map(tone => (
                    <button
                      key={tone}
                      onClick={() => setSkinTone(tone)}
                      className={cn(
                        "py-3 px-4 rounded-full text-sm transition-all border",
                        skinTone === tone 
                          ? "bg-brand-olive text-white border-brand-olive shadow-md" 
                          : "bg-stone-50 text-stone-600 border-stone-100 hover:border-brand-olive/30"
                      )}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400 mb-3">Occasion</label>
                <div className="relative">
                  <select
                    value={occasion}
                    onChange={(e) => {
                      setOccasion(e.target.value);
                      if (e.target.value !== 'Other') setCustomOccasion('');
                    }}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-olive/20"
                  >
                    <option value="">Select an occasion</option>
                    {OCCASIONS.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                    <option value="Other">Custom Occasion...</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    <ChevronRight size={16} className="rotate-90" />
                  </div>
                </div>

                {occasion === 'Other' && (
                  <motion.input
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="text"
                    placeholder="Describe the event..."
                    value={customOccasion}
                    onChange={(e) => setCustomOccasion(e.target.value)}
                    className="w-full mt-3 bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-olive/20"
                  />
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!skinTone || (!occasion && !customOccasion) || isGenerating}
                className={cn(
                  "w-full py-4 rounded-full font-medium transition-all flex items-center justify-center gap-2 shadow-lg",
                  isGenerating 
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed" 
                    : "bg-brand-olive text-white hover:bg-brand-olive/90 active:scale-95"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Curating Palette...
                  </>
                ) : (
                  <>
                    <Palette size={20} />
                    Generate My Palette
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-brand-olive/5 p-6 rounded-[32px] border border-brand-olive/10">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-brand-olive mt-1 shrink-0" />
              <p className="text-xs text-stone-600 leading-relaxed">
                Our AI considers color theory and professional makeup standards to recommend shades that enhance your natural beauty.
              </p>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="md:col-span-7">
          <AnimatePresence mode="wait">
            {palette ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 md:p-10 rounded-[40px] shadow-xl border border-stone-100 relative overflow-hidden"
              >
                {/* Decorative element */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-olive/5 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-serif text-brand-olive">Your Curated Palette</h2>
                    <Heart size={24} className="text-brand-olive/20 hover:text-red-400 cursor-pointer transition-colors" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xs uppercase tracking-widest font-semibold text-stone-400 mb-2">Lipstick</h3>
                        <p className="text-xl font-serif text-stone-800">{palette.lipstick}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-xs uppercase tracking-widest font-semibold text-stone-400 mb-2">Blush</h3>
                        <p className="text-xl font-serif text-stone-800">{palette.blush}</p>
                      </div>

                      <div>
                        <h3 className="text-xs uppercase tracking-widest font-semibold text-stone-400 mb-2">Highlighter</h3>
                        <p className="text-xl font-serif text-stone-800">{palette.highlighter}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xs uppercase tracking-widest font-semibold text-stone-400 mb-2">Eyeshadow Trio</h3>
                        <div className="flex flex-wrap gap-2">
                          {palette.eyeshadow.map((color, i) => (
                            <span key={i} className="px-3 py-1 bg-stone-50 border border-stone-100 rounded-full text-sm text-stone-700">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-stone-100">
                        <h3 className="text-xs uppercase tracking-widest font-semibold text-stone-400 mb-2">Artist's Note</h3>
                        <p className="text-sm text-stone-600 italic leading-relaxed">
                          "{palette.explanation}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] bg-stone-50/50 border-2 border-dashed border-stone-200 rounded-[40px] flex flex-col items-center justify-center text-center p-12"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                  <Palette size={32} className="text-stone-300" />
                </div>
                <h3 className="text-2xl font-serif text-stone-400 mb-2">Ready to Glow?</h3>
                <p className="text-stone-400 max-w-xs">
                  Fill in your profile details to see your personalized makeup recommendations.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Chat Bot */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-[32px] shadow-2xl border border-stone-100 flex flex-col overflow-hidden"
            >
              {/* Chat Header */}
              <div className="bg-brand-olive p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg leading-tight">GlowGuide Chat</h3>
                    <p className="text-[10px] uppercase tracking-widest opacity-70">Expert Beauty Advisor</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div 
                      className={cn(
                        "max-w-[85%] p-4 rounded-2xl text-sm",
                        msg.role === 'user' 
                          ? "bg-brand-olive text-white rounded-tr-none" 
                          : "bg-stone-100 text-stone-800 rounded-tl-none"
                      )}
                    >
                      <div className="markdown-body">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-stone-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                      <motion.div 
                        animate={{ opacity: [0.3, 1, 0.3] }} 
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-1.5 h-1.5 bg-stone-400 rounded-full" 
                      />
                      <motion.div 
                        animate={{ opacity: [0.3, 1, 0.3] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-1.5 h-1.5 bg-stone-400 rounded-full" 
                      />
                      <motion.div 
                        animate={{ opacity: [0.3, 1, 0.3] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-1.5 h-1.5 bg-stone-400 rounded-full" 
                      />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-stone-100 bg-stone-50">
                <div className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about techniques, products..."
                    className="w-full bg-white border border-stone-200 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-olive/20"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-olive text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-all"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-brand-olive text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-brand-olive/90 transition-all"
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </motion.button>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 text-stone-400 text-xs uppercase tracking-widest font-medium">
        &copy; 2026 GlowGuide AI &bull; Curated with Care
      </footer>
    </div>
  );
}

