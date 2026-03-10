import { Request, Response, NextFunction } from 'express';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  systemContext?: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are Alex, an English coach for Vietnamese Fullstack developers.
Help them practice English for tech workplace scenarios.
When they make grammar mistakes, gently correct them and explain why.
Keep responses conversational and encouraging.
Focus on: technical vocabulary, professional communication, code review language,
standup meetings, emails, and interview preparation.
Keep responses concise (1-2 paragraphs max).
Use simple, clear English suitable for learners.`;

/* ── Groq (free tier) ──────────────────────────────────────────────── */
async function callGroq(messages: ChatMessage[], systemPrompt: string): Promise<string> {
  const { default: Groq } = await import('groq-sdk');
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant', // fast, free model
    max_tokens: 500,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  return completion.choices[0]?.message?.content ?? '';
}

/* ── Claude (fallback if ANTHROPIC_API_KEY exists) ─────────────────── */
async function callClaude(messages: ChatMessage[], systemPrompt: string): Promise<string> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001', // cheapest claude
    max_tokens: 500,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const block = response.content.find((b) => b.type === 'text');
  return block && block.type === 'text' ? block.text : '';
}

/* ── Rule-based fallback (zero API cost) ───────────────────────────── */
function ruleBasedReply(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello! 👋 I'm Alex, your English coach. What would you like to practice today? You can ask me to: correct your grammar, explain vocabulary, practice a standup meeting, or help write an email.";
  }
  if (msg.includes('standup') || msg.includes('daily') || msg.includes('scrum')) {
    return "Great! Let's practice your daily standup. Try saying:\n\n\"Yesterday I worked on [task]. Today I will [task]. I have no blockers.\"\n\nNow you try — tell me what you worked on yesterday! 🎯";
  }
  if (msg.includes('correct') || msg.includes('grammar') || msg.includes('mistake')) {
    return "Sure! Share a sentence or paragraph and I'll check your grammar. For example, write something like: 'I working on the login feature yesterday' and I'll correct it for you. ✏️";
  }
  if (msg.includes('interview') || msg.includes('job') || msg.includes('question')) {
    return "Let's practice! Here's a common tech interview question:\n\n**\"Can you tell me about yourself?\"**\n\nTry answering in English. Focus on: your current role, your main skills, and why you're interested in the position. I'll give feedback! 💼";
  }
  if (msg.includes('email') || msg.includes('write') || msg.includes('message')) {
    return "Let's write a professional email! Here's a template:\n\n**Subject:** Update on [project]\n\n*Hi [Name],*\n*I wanted to update you on the progress of [task]. Currently, [status]. Please let me know if you have any questions.*\n*Best regards, [Your name]*\n\nTry writing your own email and I'll review it! 📧";
  }
  if (msg.includes('vocabulary') || msg.includes('word') || msg.includes('mean')) {
    return "Here are 5 essential tech words for today:\n\n1. **Deploy** (triển khai) — \"We will deploy the app tonight.\"\n2. **Refactor** (tái cấu trúc) — \"I need to refactor this messy code.\"\n3. **Scalable** (có thể mở rộng) — \"Our system must be scalable.\"\n4. **Bottleneck** (nút cổ chai) — \"The database is the bottleneck.\"\n5. **Iterate** (lặp lại cải tiến) — \"Let's iterate on the design.\"\n\nWant to practice using any of these? 📚";
  }
  if (msg.includes('pull request') || msg.includes('code review') || msg.includes('pr')) {
    return "Here's how to write a good pull request comment in English:\n\n✅ **Positive:** \"Great implementation! The code is clean and readable.\"\n💡 **Suggestion:** \"Could we consider caching this result to improve performance?\"\n❓ **Question:** \"What's the reason for using this approach here?\"\n\nPractice by writing a comment about some code you're working on! 🔍";
  }
  if (msg.includes('thank') || msg.includes('thanks')) {
    return "You're welcome! 😊 Keep practicing — consistency is key to becoming fluent. Come back anytime you want to practice English. You're doing great! 🌟";
  }

  // Generic helpful response
  const replies = [
    "That's interesting! In professional English, we often express this more formally. Try rephrasing it as a complete sentence starting with 'I' or 'We'. What were you trying to say? 🤔",
    "Good effort! A tip: in tech workplaces, be specific and direct. Instead of vague words, use precise technical terms. Can you tell me more context? 💡",
    "Let me help you express that more naturally! In English, we often structure sentences as: Subject + Verb + Object. Can you share more about what you want to communicate? 📝",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

/* ── Controller ───────────────────────────────────────────────────── */
export const chatController = {
  async chat(req: Request<any, any, ChatRequest>, res: Response, next: NextFunction) {
    try {
      const { messages, systemContext } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: 'Invalid messages format' });
      }

      const systemPrompt = systemContext || DEFAULT_SYSTEM_PROMPT;
      const lastUserMessage = messages[messages.length - 1]?.content ?? '';
      let reply = '';

      // Priority: Groq (free) → Claude → Rule-based
      if (process.env.GROQ_API_KEY) {
        reply = await callGroq(messages, systemPrompt);
      } else if (process.env.ANTHROPIC_API_KEY) {
        reply = await callClaude(messages, systemPrompt);
      } else {
        reply = ruleBasedReply(lastUserMessage);
      }

      return res.json({ success: true, message: reply });
    } catch (error) {
      console.error('Chat error:', error);
      // If AI call fails, gracefully fall back to rule-based
      const lastUserMessage = req.body?.messages?.at(-1)?.content ?? '';
      return res.json({ success: true, message: ruleBasedReply(lastUserMessage) });
    }
  },

  // Info endpoint — tells frontend which AI is active
  status(_req: Request, res: Response) {
    const provider = process.env.GROQ_API_KEY
      ? 'groq'
      : process.env.ANTHROPIC_API_KEY
        ? 'claude'
        : 'rule-based';
    res.json({ success: true, provider });
  },
};
