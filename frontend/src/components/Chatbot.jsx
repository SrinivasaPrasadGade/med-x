import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { api } from '../api';

const Chatbot = ({ context, role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hi! I'm your MedX Assistant. What can I help you with today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', content: userMessage }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Send message along with previous history, context, and role
      const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));
      
      const response = await api.sendChatMessage({
        message: userMessage,
        history: historyForApi,
        context: context || 'None',
        role: role || 'Guest'
      });

      setMessages(prev => [...prev, { role: 'model', content: response.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I am having trouble connecting to the server. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Thought Bubble Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center z-[999] group"
          aria-label="Open Chat Assistant"
        >
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-[999] overflow-hidden border border-border/50 fade-in">
          {/* Header */}
          <div className="px-4 py-3 bg-primary text-white flex justify-between items-center bg-gradient-to-r from-primary to-primary/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white/90" />
              <div>
                <h3 className="font-semibold text-sm">MedX Assistant</h3>
                <p className="text-xs text-white/70">Always here to help</p>
              </div>
            </div>
            <button 
              onClick={toggleChat} 
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-none' 
                      : 'bg-white border border-border text-foreground rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-white border border-border rounded-2xl rounded-bl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground text-xs font-medium">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-border">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about MedX..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
