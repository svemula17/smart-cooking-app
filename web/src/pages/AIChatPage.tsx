import { useState, useRef, useEffect } from 'react';
import { chat, ChatMessage } from '../api/ai';
import { useAuth } from '../context/AuthContext';

const SUGGESTIONS = [
  'What can I cook with chicken and broccoli?',
  'Suggest a high-protein vegetarian meal',
  'How do I substitute eggs in baking?',
  'Quick 15-minute dinner ideas',
];

export default function AIChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm your cooking assistant. Ask me about recipes, substitutions, meal ideas, or cooking tips!" },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || sending || !user?.id) return;

    const userMsg: ChatMessage = { role: 'user', content: message };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setSending(true);

    try {
      const reply = await chat(user.id, message, messages);
      setMessages([...newHistory, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages([...newHistory, { role: 'assistant', content: `Sorry, I ran into an error: ${e.message}` }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>🤖</span> AI Cooking Assistant
        </h1>
        <p className="text-gray-500 text-sm mt-1">Get personalized recipe suggestions and cooking advice</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-green-600 text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-500">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:bg-green-50 hover:border-green-300 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about cooking..."
          disabled={sending}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
