
import React, { useEffect, useState } from 'react';
import ChatWindow from '@/components/ChatWindow';
import { Toaster } from '@/components/ui/sonner';
import { getEffectiveApiConfig } from '@/utils/storage';
import ApiKeyModal from '@/components/ApiKeyModal';

const Index = () => {
  const [showApiModal, setShowApiModal] = useState(false);

  useEffect(() => {
    // Check if API config exists
    const effectiveConfig = getEffectiveApiConfig();
    if (!effectiveConfig) {
      setShowApiModal(true);
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
