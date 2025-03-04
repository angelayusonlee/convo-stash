
import { ChatConversation, ApiConfig } from '../types/chat';

const CONVERSATIONS_KEY = 'chat-conversations';
const CURRENT_CONVERSATION_KEY = 'current-conversation-id';
const API_CONFIG_KEY = 'api-config';

// New function to get embedded data from Qualtrics
export const getQualtricsEmbeddedData = (): Record<string, string> => {
  try {
    // Check if we're in a Qualtrics environment
    if (typeof window !== 'undefined' && window.Qualtrics) {
      return window.Qualtrics.SurveyEngine.getEmbeddedData() || {};
    }
    
    // For development or non-Qualtrics environments, check URL parameters
    const params = new URLSearchParams(window.location.search);
    const apiKey = params.get('apiKey');
    const model = params.get('model');
    
    const data: Record<string, string> = {};
    if (apiKey) data.apiKey = apiKey;
    if (model) data.model = model;
    
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
  if (embeddedData.apiKey) {
    return {
      apiKey: embeddedData.apiKey,
      model: embeddedData.model || 'openai/gpt-4o-mini'
    };
  }
  
  // Fall back to stored config if no embedded data is found
  const config = localStorage.getItem(API_CONFIG_KEY);
  return config ? JSON.parse(config) : null;
};

export const getEffectiveApiConfig = (): ApiConfig | null => {
  return getApiConfig();
};

export const saveConversation = (conversation: ChatConversation): void => {
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
