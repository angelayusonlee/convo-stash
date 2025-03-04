
import React, { useEffect, useState } from 'react';
import ChatWindow from '@/components/ChatWindow';
import { Toaster } from '@/components/ui/sonner';
import { getEffectiveApiConfig, getUrlParameters } from '@/utils/storage';
import ApiKeyModal from '@/components/ApiKeyModal';

const Index = () => {
  const [showApiModal, setShowApiModal] = useState(false);

  useEffect(() => {
    // Check for URL parameters first
    const urlParams = getUrlParameters();
    console.log("Index: Checking for URL parameters", urlParams);
    
    // Only show API modal if no API key in URL parameters AND no stored config
    if (!urlParams.OpenRouterAPI) {
      const effectiveConfig = getEffectiveApiConfig();
      console.log("Index: No URL API key, checking stored config", effectiveConfig);
      if (!effectiveConfig) {
        console.log("Index: No stored config either, showing API modal");
        setShowApiModal(true);
      }
    } else {
      console.log("Index: Found URL API key, no need for modal");
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
