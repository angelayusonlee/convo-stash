import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Settings, Send, Download, Trash, PlusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import ApiKeyModal from './ApiKeyModal';
import ExportModal from './ExportModal';
import ChatMessage from './ChatMessage';
import { ApiConfig, ChatConversation, ChatMessage as ChatMessageType } from '@/types/chat';
import { 
  getApiConfig, 
  saveApiConfig, 
  getConversations, 
  saveConversation, 
  getCurrentConversationId,
  setCurrentConversationId,
  getConversation,
  deleteConversation,
  getEffectiveApiConfig
} from '@/utils/storage';
import { callChatApi } from '@/utils/openai';

const ChatWindow: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    const config = getEffectiveApiConfig();
    setApiConfig(config);
    
    loadConversations();
    
    const intervalId = setInterval(() => {
      const newConfig = getEffectiveApiConfig();
      if (JSON.stringify(newConfig) !== JSON.stringify(apiConfig)) {
        setApiConfig(newConfig);
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const loadConversations = () => {
    const allConversations = getConversations();
    setConversations(allConversations);
    
    const currentId = getCurrentConversationId();
    if (currentId) {
      const current = getConversation(currentId);
      if (current) {
        setCurrentConversation(current);
        return;
      }
    }
    
    if (allConversations.length > 0) {
      setCurrentConversation(allConversations[0]);
      setCurrentConversationId(allConversations[0].id);
    } else {
      createNewConversation();
    }
  };
  
  const createNewConversation = () => {
    const newConversation: ChatConversation = {
      id: uuidv4(),
      title: `New Chat ${new Date().toLocaleString()}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: apiConfig?.model || 'openai/gpt-4o-mini'
    };
    
    saveConversation(newConversation);
    setCurrentConversation(newConversation);
    loadConversations();
  };
  
  const handleApiConfigSaved = (config: ApiConfig) => {
    setApiConfig(config);
  };
  
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const effectiveConfig = getEffectiveApiConfig();
    
    if (!effectiveConfig) {
      toast.error("API configuration is missing. Please set up your API key.");
      setShowApiModal(true);
      return;
    }
    
    if (!currentConversation) {
      createNewConversation();
      return;
    }
    
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };
    
    const updatedMessages = [...(currentConversation.messages || []), userMessage];
    const updatedConversation = {
      ...currentConversation,
      messages: updatedMessages,
      updatedAt: Date.now()
    };
    
    setCurrentConversation(updatedConversation);
    saveConversation(updatedConversation);
    setInput('');
    
    setIsLoading(true);
    try {
      const response = await callChatApi(updatedMessages, effectiveConfig);
      
      const assistantMessage: ChatMessageType = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      const finalConversation = {
        ...updatedConversation,
        messages: finalMessages,
        updatedAt: Date.now()
      };
      
      setCurrentConversation(finalConversation);
      saveConversation(finalConversation);
    } catch (error) {
      toast.error("Failed to get response from the API. Please check your API key and try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  const handleDeleteConversation = () => {
    if (!currentConversation) return;
    
    if (confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(currentConversation.id);
      loadConversations();
    }
  };
  
  const renderMessages = () => {
    if (!currentConversation || !currentConversation.messages.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to ChatGPT Clone</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Start a conversation with the AI assistant by typing a message below.
          </p>
        </div>
      );
    }
    
    return (
      <>
        {currentConversation.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="message-assistant py-6 px-4 border-b border-chat-border">
            <div className="max-w-4xl mx-auto flex gap-4 items-start">
              <div className="bg-muted rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">Assistant</p>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </>
    );
  };
  
  return (
    <div className="chat-container">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={createNewConversation}
            title="New Conversation"
          >
            <PlusCircle size={20} />
          </Button>
          <h1 className="text-lg font-medium">
            {currentConversation?.title || 'New Conversation'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowExportModal(true)}
            title="Export Conversations"
          >
            <Download size={20} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDeleteConversation}
            disabled={!currentConversation || currentConversation.messages.length === 0}
            title="Delete Conversation"
          >
            <Trash size={20} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowApiModal(true)}
            title="API Settings"
          >
            <Settings size={20} />
          </Button>
        </div>
      </div>
      
      <div className="chat-messages">
        {renderMessages()}
      </div>
      
      <div className="chat-input-container">
        <div className="relative max-w-4xl mx-auto">
          <Textarea
            ref={textareaRef}
            placeholder="Type your message here..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="pr-12 min-h-[60px] max-h-[200px] chat-input"
            disabled={isLoading || !apiConfig}
          />
          <Button 
            className="absolute right-3 bottom-3"
            size="icon"
            disabled={!input.trim() || isLoading || !apiConfig}
            onClick={handleSendMessage}
          >
            <Send size={18} />
          </Button>
        </div>
        {!apiConfig && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            Please set up your API key in settings
          </p>
        )}
      </div>
      
      <ApiKeyModal 
        open={showApiModal} 
        onOpenChange={setShowApiModal} 
        onApiConfigSaved={handleApiConfigSaved} 
      />
      <ExportModal 
        open={showExportModal} 
        onOpenChange={setShowExportModal} 
        currentConversation={currentConversation}
        allConversations={conversations}
      />
    </div>
  );
};

export default ChatWindow;
