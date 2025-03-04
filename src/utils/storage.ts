
import { ChatConversation, ApiConfig } from '../types/chat';

const CONVERSATIONS_KEY = 'chat-conversations';
const CURRENT_CONVERSATION_KEY = 'current-conversation-id';
const API_CONFIG_KEY = 'api-config';
const SESSION_STARTED_KEY = 'session-started';

// Get configuration from URL parameters (for development testing)
export const getUrlParameters = (): Record<string, string> => {
  try {
    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const apiKey = params.get('apiKey');
    const model = params.get('model');
    const endpoint = params.get('endpoint');
    
    const data: Record<string, string> = {};
    if (apiKey) data.OpenRouterAPI = apiKey;
    if (model) data.setModel = model;
    if (endpoint) data.OpenAIEndpoint = endpoint;
    
    return data;
  } catch (error) {
    console.error('Error accessing URL parameters:', error);
    return {};
  }
};

export const saveApiConfig = (config: ApiConfig): void => {
  localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
};

export const getApiConfig = (): ApiConfig | null => {
  // First try to get from URL parameters
  const urlParams = getUrlParameters();
  
  // Check for the OpenRouterAPI variable
  if (urlParams.OpenRouterAPI) {
    console.log('Found OpenRouterAPI in URL parameters');
    
    // Extract the API key, removing "Bearer " prefix if present
    const apiKey = urlParams.OpenRouterAPI.startsWith('Bearer ') 
      ? urlParams.OpenRouterAPI.substring(7) 
      : urlParams.OpenRouterAPI;
    
    // Get endpoint from URL parameters or use default
    const endpoint = urlParams.OpenAIEndpoint || null;
    
    // Get model from URL parameters or use default
    const model = urlParams.setModel || 'openai/gpt-4o-mini';
    
    // Create and save the config to localStorage
    const config = {
      apiKey: apiKey,
      model: model,
      endpoint: endpoint
    };
    
    // Save to localStorage for future reference
    saveApiConfig(config);
    
    return config;
  }
  
  // Fall back to stored config if no URL parameters are found
  const config = localStorage.getItem(API_CONFIG_KEY);
  return config ? JSON.parse(config) : null;
};

export const getEffectiveApiConfig = (): ApiConfig | null => {
  return getApiConfig();
};

// Check if this is a new session
const isNewSession = (): boolean => {
  const sessionStarted = localStorage.getItem(SESSION_STARTED_KEY);
  if (!sessionStarted) {
    localStorage.setItem(SESSION_STARTED_KEY, Date.now().toString());
    return true;
  }
  return false;
};

// Clear previous conversations if it's a new session
const initializeNewSession = (): void => {
  if (isNewSession()) {
    localStorage.removeItem(CONVERSATIONS_KEY);
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
  }
};

export const saveConversation = (conversation: ChatConversation): void => {
  initializeNewSession(); // Initialize if needed
  const conversations = getConversations();
  const existingIndex = conversations.findIndex(c => c.id === conversation.id);
  
  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation;
  } else {
    conversations.push(conversation);
  }
  
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  setCurrentConversationId(conversation.id);
};

export const getConversations = (): ChatConversation[] => {
  initializeNewSession(); // Initialize if needed
  const conversations = localStorage.getItem(CONVERSATIONS_KEY);
  return conversations ? JSON.parse(conversations) : [];
};

export const getConversation = (id: string): ChatConversation | null => {
  const conversations = getConversations();
  return conversations.find(c => c.id === id) || null;
};

export const getCurrentConversationId = (): string | null => {
  return localStorage.getItem(CURRENT_CONVERSATION_KEY);
};

export const setCurrentConversationId = (id: string): void => {
  localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
};

export const deleteConversation = (id: string): void => {
  let conversations = getConversations();
  conversations = conversations.filter(c => c.id !== id);
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  
  if (getCurrentConversationId() === id) {
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
  }
};

export const exportConversationToJson = (conversation: ChatConversation): string => {
  return JSON.stringify(conversation, null, 2);
};

export const exportAllConversationsToJson = (): string => {
  const conversations = getConversations();
  return JSON.stringify(conversations, null, 2);
};

export const downloadJson = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
