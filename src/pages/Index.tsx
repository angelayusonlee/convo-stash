
import React, { useEffect, useState } from 'react';
import ChatWindow from '@/components/ChatWindow';
import { Toaster } from '@/components/ui/sonner';
import { getEffectiveApiConfig, getQualtricsEmbeddedData } from '@/utils/storage';
import ApiKeyModal from '@/components/ApiKeyModal';

const Index = () => {
  const [showApiModal, setShowApiModal] = useState(false);

  useEffect(() => {
    // Check for embedded Qualtrics data first
    const embeddedData = getQualtricsEmbeddedData();
    
    // Only show API modal if no embedded data for API key exists AND no stored config
    if (!embeddedData.OpenRouterAPI) {
      const effectiveConfig = getEffectiveApiConfig();
      if (!effectiveConfig) {
        setShowApiModal(true);
      }
    }
  }, []);

  const handleApiConfigSaved = () => {
    setShowApiModal(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-0 relative">
      <ChatWindow />
      <Toaster position="top-center" />
      <ApiKeyModal 
        open={showApiModal} 
        onOpenChange={setShowApiModal} 
        onApiConfigSaved={handleApiConfigSaved} 
      />
    </div>
  );
};

export default Index;
