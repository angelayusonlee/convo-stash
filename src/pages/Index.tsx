
import React, { useEffect, useState } from 'react';
import ChatWindow from '@/components/ChatWindow';
import { Toaster } from '@/components/ui/sonner';
import { getEffectiveApiConfig, getAdminApiConfig } from '@/utils/storage';
import { Badge } from '@/components/ui/badge';
import ApiKeyModal from '@/components/ApiKeyModal';

const Index = () => {
  const [isUsingAdminConfig, setIsUsingAdminConfig] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  useEffect(() => {
    // Check if API config exists
    const effectiveConfig = getEffectiveApiConfig();
    if (!effectiveConfig) {
      setShowApiModal(true);
    }

    // Check if admin config is being used
    const adminConfig = getAdminApiConfig();
    setIsUsingAdminConfig(!!adminConfig);

    // Set up a listener to check for storage changes
    const handleStorageChange = () => {
      const adminConfig = getAdminApiConfig();
      setIsUsingAdminConfig(!!adminConfig);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check every 2 seconds in case localStorage was modified by the same window
    const intervalId = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const handleApiConfigSaved = () => {
    setShowApiModal(false);
    // Force refresh isUsingAdminConfig
    const adminConfig = getAdminApiConfig();
    setIsUsingAdminConfig(!!adminConfig);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-0 relative">
      {isUsingAdminConfig && (
        <div className="absolute top-2 right-2 z-50">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Admin Mode
          </Badge>
        </div>
      )}
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
