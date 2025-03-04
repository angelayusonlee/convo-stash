
import { ChatConversation, ApiConfig } from '../types/chat';

const CONVERSATIONS_KEY = 'chat-conversations';
const CURRENT_CONVERSATION_KEY = 'current-conversation-id';
const API_CONFIG_KEY = 'api-config';
const SESSION_STARTED_KEY = 'session-started';

// Get embedded data from Qualtrics
export const getQualtricsEmbeddedData = (): Record<string, string> => {
  try {
    // Check if we're in a Qualtrics environment
    if (typeof window !== 'undefined' && window.Qualtrics && window.Qualtrics.SurveyEngine.getEmbeddedData) {
      const data = window.Qualtrics.SurveyEngine.getEmbeddedData() || {};
      console.log('Retrieved Qualtrics embedded data:', data);
      return data;
    }
    
    // For development or non-Qualtrics environments, check URL parameters
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
    console.error('Error accessing Qualtrics embedded data:', error);
    return {};
  }
};

export const saveApiConfig = (config: ApiConfig): void => {
  localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
};

export const getApiConfig = (): ApiConfig | null => {
  // First try to get from Qualtrics embedded data
  const embeddedData = getQualtricsEmbeddedData();
  
  // Check for the OpenRouterAPI variable
  if (embeddedData.OpenRouterAPI) {
    console.log('Found OpenRouterAPI in embedded data');
    
    // Extract the API key, removing "Bearer " prefix if present
    const apiKey = embeddedData.OpenRouterAPI.startsWith('Bearer ') 
      ? embeddedData.OpenRouterAPI.substring(7) 
      : embeddedData.OpenRouterAPI;
    
    // Get endpoint from embedded data or use default
    const endpoint = embeddedData.OpenAIEndpoint || null;
    
    // Get model from embedded data or use default
    const model = embeddedData.setModel || 'openai/gpt-4o-mini';
    
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
  
  // Fall back to stored config if no embedded data is found
  const config = localStorage.getItem(API_CONFIG_KEY);
  return config ? JSON.parse(config) : null;
};

export const getEffectiveApiConfig = (): ApiConfig | null => {
  return getApiConfig();
};

// Update chatHistory embedded data in Qualtrics
export const updateChatHistoryInQualtrics = (conversation: ChatConversation): void => {
  try {
    if (typeof window !== 'undefined' && window.Qualtrics && window.Qualtrics.SurveyEngine) {
      // Check if setEmbeddedData method exists
      if (window.Qualtrics.SurveyEngine.setEmbeddedData) {
        // Convert the full conversation to a JSON string to store in chatHistory
        const chatHistoryJson = JSON.stringify(conversation);
        window.Qualtrics.SurveyEngine.setEmbeddedData('chatHistory', chatHistoryJson);
        console.log('Updated Qualtrics chatHistory with:', conversation.messages.length, 'messages');
      } else {
        console.log('Qualtrics setEmbeddedData method not available');
      }
    } else {
      console.log('Qualtrics SurveyEngine not available - running in development mode');
    }
  } catch (error) {
    console.error('Error updating Qualtrics chatHistory:', error);
  }
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
  
  // Update Qualtrics chatHistory
  updateChatHistoryInQualtrics(conversation);
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
