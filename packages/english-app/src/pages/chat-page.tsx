import { useState, useEffect, useRef } from 'react';
import { Send, Mic, Volume2 } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { BottomNav } from '@/components/BottomNav';
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

type ChatMode = 'tech' | 'travel' | 'free';

export function ChatPage() {
  const { addChatMessage, getProgress } = useProgress();
  const [messages, setMessages] = useState<ChatMessage[]>(
    getProgress().chatHistory
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('free');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = {
    tech: [
      'Standup practice',
      'Code review',
      'Fix my grammar',
      'Tech interview',
    ],
    travel: [
      'Đặt phòng khách sạn',
      'Order food',
      'Ask for directions',
      'At airport',
    ],
    free: [
      'Correct my English',
      'Translate this',
      'Explain this phrase',
      'Tell me a story',
    ],
  };

  const getModeDescription = (mode: ChatMode) => {
    const descriptions = {
      tech: '💻 Chế độ tech — dành cho lập trình viên',
      travel: '✈️ Chế độ du lịch — tiếng Anh giao tiếp',
      free: '🗣️ Tự do — thực hành bất cứ điều gì',
    };
    return descriptions[mode];
  };

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    addChatMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt =
        chatMode === 'tech'
          ? 'You are an English teacher helping a Vietnamese fullstack developer. Focus on software development vocabulary and workplace English for tech professionals. Keep responses concise and practical. If the user makes grammar mistakes, gently correct them in square brackets [correction].'
          : chatMode === 'travel'
            ? 'You are an English teacher helping with travel English. Focus on common phrases for airports, hotels, restaurants, and navigation. Keep responses practical and conversational.'
            : 'You are a friendly English conversation partner. Help the user practice English naturally. If they make grammar mistakes, gently correct them.';

      const response = await axios.post(
        '/api/english/chat',
        {
          message: text,
          systemPrompt,
        },
        { timeout: 30000 }
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      addChatMessage(assistantMessage);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content:
          'Sorry, I had trouble understanding. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support voice input');
      return;
    }

    const SpeechRecognition =
      window.webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0f172a] pb-24">
      {/* Header */}
      <div className="border-b border-[#1f2d40] bg-[#111827] px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Chat với AI</h1>
          <p className="mt-1 text-sm text-[#94a3b8]">
            {getModeDescription(chatMode)}
          </p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="border-b border-[#1f2d40] bg-[#111827] px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-2xl flex gap-2">
          {(['tech', 'travel', 'free'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setChatMode(mode)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                chatMode === mode
                  ? 'bg-[#10b981] text-white'
                  : 'bg-[#334155] text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              {mode === 'tech' && '💻'}
              {mode === 'travel' && '✈️'}
              {mode === 'free' && '🗣️'}
            </button>
          ))}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 text-5xl">💬</div>
              <h2 className="text-xl font-bold text-[#f1f5f9]">
                Bắt đầu cuộc trò chuyện
              </h2>
              <p className="mt-2 text-[#94a3b8]">
                Gửi tin nhắn hoặc chọn một gợi ý dưới đây
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-[#10b981] text-white'
                      : 'border border-[#1f2d40] bg-[#1e293b] text-[#f1f5f9]'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg border border-[#1f2d40] bg-[#1e293b] px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#94a3b8] animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-[#94a3b8] animate-bounce delay-100" />
                  <div className="h-2 w-2 rounded-full bg-[#94a3b8] animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div className="border-t border-[#1f2d40] bg-[#111827] px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-2xl">
            <p className="mb-3 text-xs font-semibold text-[#94a3b8] uppercase">
              Gợi ý
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts[chatMode].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="rounded-lg border border-[#1f2d40] bg-[#1e293b] px-3 py-2 text-sm text-[#cbd5e1] hover:border-[#10b981] hover:text-[#10b981] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-[#1f2d40] bg-[#111827] px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSendMessage();
              }
            }}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-lg border border-[#1f2d40] bg-[#0f172a] px-4 py-3 text-[#f1f5f9] placeholder-[#94a3b8] focus:border-[#10b981] focus:outline-none"
          />
          <button
            onClick={handleVoiceInput}
            disabled={isLoading}
            className={`rounded-lg p-3 font-semibold ${
              isListening
                ? 'bg-[#ef4444] text-white'
                : 'bg-[#334155] text-[#f1f5f9] hover:bg-[#475569]'
            } disabled:opacity-50 transition-colors`}
          >
            <Mic size={20} />
          </button>
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-[#10b981] px-4 py-3 font-semibold text-white hover:bg-[#059669] disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
