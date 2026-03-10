import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProgress } from '@/hooks/useProgress';
import { useSpeech } from '@/hooks/useSpeech';
import { Send, Mic, MicOff, Loader } from 'lucide-react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const ChatPage = () => {
  const { addChatMessage, getProgress } = useProgress();
  const { startListening, isListening } = useSpeech();
  const [messages, setMessages] = useState<Message[]>(getProgress().chatHistory);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    { text: 'Correct my grammar', icon: '✍️' },
    { text: 'Explain this word', icon: '📚' },
    { text: 'Practice standup', icon: '🎤' },
    { text: 'Help with email', icon: '📧' },
    { text: 'Mock interview', icon: '🎯' },
    { text: 'Code review tips', icon: '💻' },
  ];

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    addChatMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/english/chat', {
        messages: [...messages, userMessage],
        systemContext: `You are Alex, an English coach for Vietnamese Fullstack developers.
          Help them practice English for tech workplace scenarios.
          When they make grammar mistakes, gently correct them and explain why.
          Keep responses conversational and encouraging.
          Focus on: technical vocabulary, professional communication, code review language,
          standup meetings, emails, and interview preparation.`,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message || 'I understand. Let me help you with that.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      addChatMessage(assistantMessage);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    startListening(
      (transcript) => {
        setInput(transcript);
      },
      (error) => {
        console.error('Speech recognition error:', error);
      },
    );
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-200px)] flex flex-col space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">🎓</div>
          <div>
            <h1 className="text-3xl font-bold text-[#f1f5f9]">Alex — Your English Coach</h1>
            <p className="text-[#94a3b8]">Practice English for tech workplace</p>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <Card className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-6xl">👋</div>
            <h3 className="text-xl font-semibold text-[#f1f5f9]">Hey there! I'm Alex</h3>
            <p className="text-[#94a3b8] max-w-xs">
              I'm here to help you practice English for tech workplace scenarios. Let's get started!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[#10b981]/30 text-[#34d399] border border-[#10b981]/50'
                      : 'bg-[#334155] text-[#f1f5f9]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p className="text-xs text-[#94a3b8] mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#334155] text-[#f1f5f9] px-4 py-3 rounded-lg flex items-center gap-2">
                  <Loader size={16} className="animate-spin" />
                  <span className="text-sm">Alex is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </Card>

      {/* Quick Prompts */}
      {messages.length === 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#94a3b8] font-medium">Suggested topics:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt.text}
                variant="secondary"
                size="sm"
                onClick={() => handleSendMessage(prompt.text)}
                className="text-xs justify-center"
              >
                <span>{prompt.icon}</span>
                {prompt.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <Card className="p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message... (or use voice)"
            className="flex-1 bg-[#0f172a] text-[#f1f5f9] placeholder-[#64748b] rounded-lg px-4 py-2 border border-[#475569] focus:outline-none focus:border-[#10b981]"
          />

          <Button
            variant="secondary"
            size="sm"
            onClick={handleVoiceInput}
            className={isListening ? 'bg-[#dc2626]/20 border-[#dc2626]/50' : ''}
          >
            {isListening ? (
              <MicOff size={18} className="text-[#dc2626]" />
            ) : (
              <Mic size={18} />
            )}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} />
          </Button>
        </div>
      </Card>
    </div>
  );
};
