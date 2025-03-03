
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChatConversation } from '@/types/chat';
import { downloadJson, exportConversationToJson, exportAllConversationsToJson } from '@/utils/storage';
import { Download } from 'lucide-react';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentConversation: ChatConversation | null;
  allConversations: ChatConversation[];
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  open, 
  onOpenChange, 
  currentConversation, 
  allConversations 
}) => {
  const handleExportCurrent = () => {
    if (!currentConversation) return;
    
    const jsonData = exportConversationToJson(currentConversation);
    const filename = `chat-${currentConversation.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJson(jsonData, filename);
    
    onOpenChange(false);
  };
  
  const handleExportAll = () => {
    const jsonData = exportAllConversationsToJson();
    const filename = `all-chats-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJson(jsonData, filename);
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Export Conversations</DialogTitle>
          <DialogDescription>
            Export your chat conversations as JSON files.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="rounded-lg border p-4 transition-all hover:bg-muted/50">
              <h3 className="font-medium mb-1">Current Conversation</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Export only the current conversation
              </p>
              <Button 
                size="sm" 
                onClick={handleExportCurrent} 
                disabled={!currentConversation}
                className="w-full"
              >
                <Download size={16} className="mr-2" />
                Export Current
              </Button>
            </div>
            
            <div className="rounded-lg border p-4 transition-all hover:bg-muted/50">
              <h3 className="font-medium mb-1">All Conversations</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Export all {allConversations.length} conversation{allConversations.length !== 1 && 's'}
              </p>
              <Button 
                size="sm" 
                onClick={handleExportAll} 
                disabled={allConversations.length === 0}
                className="w-full"
              >
                <Download size={16} className="mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
