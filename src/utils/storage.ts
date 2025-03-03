import { ChatConversation, ApiConfig } from '../types/chat';

const CONVERSATIONS_KEY = 'chat-conversations';
const CURRENT_CONVERSATION_KEY = 'current-conversation-id';
const API_CONFIG_KEY = 'api-config';
const ADMIN_API_CONFIG_KEY = 'admin-api-config';

export const saveApiConfig = (config: ApiConfig): void => {
  localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
};

export const getApiConfig = (): ApiConfig | null => {
  const config = localStorage.getItem(API_CONFIG_KEY);
  return config ? JSON.parse(config) : null;
};

export const saveAdminApiConfig = (config: ApiConfig): void => {
  localStorage.setItem(ADMIN_API_CONFIG_KEY, JSON.stringify(config));
};

export const getAdminApiConfig = (): ApiConfig | null => {
  const config = localStorage.getItem(ADMIN_API_CONFIG_KEY);
  return config ? JSON.parse(config) : null;
};

export const getEffectiveApiConfig = (): ApiConfig | null => {
  // First try to get admin config, fall back to user config if not available
  const adminConfig = getAdminApiConfig();
  if (adminConfig) {
    return adminConfig;
  }
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
