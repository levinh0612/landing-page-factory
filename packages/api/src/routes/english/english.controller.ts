import { Request, Response, NextFunction } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../lib/config.js';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  systemContext?: string;
}

const client = new Anthropic();

const DEFAULT_SYSTEM_PROMPT = `You are Alex, an English coach for Vietnamese Fullstack developers.
Help them practice English for tech workplace scenarios.
When they make grammar mistakes, gently correct them and explain why.
Keep responses conversational and encouraging.
Focus on: technical vocabulary, professional communication, code review language,
standup meetings, emails, and interview preparation.
Keep responses concise (1-2 paragraphs max).
Use simple, clear English suitable for learners.`;

export const chatController = {
  async chat(req: Request<any, any, ChatRequest>, res: Response, next: NextFunction) {
    try {
      const { messages, systemContext } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: 'Invalid messages format' });
      }

      const systemPrompt = systemContext || DEFAULT_SYSTEM_PROMPT;

      // Convert messages to Anthropic format
      const anthropicMessages = messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: systemPrompt,
        messages: anthropicMessages,
      });

      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude');
      }

      return res.json({
        success: true,
        message: textContent.text,
      });
    } catch (error) {
      console.error('Chat error:', error);
      next(error);
    }
  },
};
