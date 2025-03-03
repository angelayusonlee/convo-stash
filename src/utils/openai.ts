
import { ApiConfig, ChatMessage } from '../types/chat';
import { getEffectiveApiConfig } from './storage';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const callChatApi = async (
  messages: ChatMessage[], 
  config: ApiConfig
): Promise<string> => {
  try {
    // Validate API key
    if (!config || !config.apiKey) {
      throw new Error('No auth credentials found');
    }

    // Format messages for the API (removing unnecessary fields)
    const apiMessages = messages.map(({ role, content }) => ({
      role,
      content
    }));

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ChatGPT Clone'
      },
      body: JSON.stringify({
        model: config.model,
        messages: apiMessages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response from OpenRouter');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const getAvailableModels = async (apiKey: string): Promise<string[]> => {
  try {
    if (!apiKey) {
      throw new Error('API key is required to fetch models');
    }

    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    return data.data.map((model: any) => model.id);
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return [
      'openai/gpt-4o-mini',
      'openai/gpt-4o'
    ];
  }
};
