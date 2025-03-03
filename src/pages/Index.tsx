
import React, { useEffect, useState } from 'react';
import ChatWindow from '@/components/ChatWindow';
import { Toaster } from '@/components/ui/sonner';
import { getAdminApiConfig } from '@/utils/storage';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [isUsingAdminConfig, setIsUsingAdminConfig] = useState(false);

  useEffect(() => {
    // Check if admin config is being used
    const adminConfig = getAdminApiConfig();
    setIsUsingAdminConfig(!!adminConfig);
  }, []);

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
    </div>
  );
};

export default Index;
