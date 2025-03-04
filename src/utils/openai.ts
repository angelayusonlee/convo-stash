import { ApiConfig, ChatMessage } from '../types/chat';
import { getEffectiveApiConfig } from './storage';

// Default endpoint that will be used if none is provided
const DEFAULT_OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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

    // Use endpoint from config or fall back to default
    const apiUrl = config.endpoint || DEFAULT_OPENROUTER_API_URL;

    console.log('Sending request to API:', {
      url: apiUrl,
      model: config.model,
      messages: apiMessages
    });

    // Format the Authorization header - ensure it has "Bearer " prefix
    const authHeader = config.apiKey.startsWith('Bearer ') 
      ? config.apiKey 
      : `Bearer ${config.apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Qualtrics Survey Chat Interface'
      },
      body: JSON.stringify({
        model: config.model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error?.message || `Error ${response.status}: Failed to get response from API`);
      } catch (e) {
        throw new Error(`Error ${response.status}: ${errorText || 'Failed to get response from API'}`);
      }
    }

    const data = await response.json();
    console.log('API response:', data);
    
    if (!data.choices || !data.choices.length) {
      throw new Error('Invalid response format from API');
    }

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
      const errorText = await response.text();
      console.error('Failed to fetch models:', errorText);
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    console.log('Available models:', data);
    
    if (!data.data || !Array.isArray(data.data)) {
      return getDefaultModels();
    }
    
    return data.data.map((model: any) => model.id);
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return getDefaultModels();
  }
};

const getDefaultModels = (): string[] => {
  return [
    'openai/gpt-4o-mini',
    'openai/gpt-4o',
    'anthropic/claude-3-opus',
    'anthropic/claude-3-sonnet',
    'anthropic/claude-3-haiku',
    'meta-llama/llama-3-70b-instruct',
    'google/gemini-1.5-pro'
  ];
};
