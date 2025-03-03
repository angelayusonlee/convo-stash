
import React from 'react';
import ChatWindow from '@/components/ChatWindow';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-0">
      <ChatWindow />
      <Toaster position="top-center" />
    </div>
  );
};

export default Index;
