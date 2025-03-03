import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ApiConfig } from '@/types/chat';
import { saveApiConfig, getApiConfig, saveAdminApiConfig, getAdminApiConfig } from '@/utils/storage';
import { getAvailableModels } from '@/utils/openai';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiConfigSaved: (config: ApiConfig) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, onOpenChange, onApiConfigSaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai/gpt-4o-mini');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([
    'openai/gpt-4o-mini',
    'openai/gpt-4o'
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for admin config first
    const adminConfig = getAdminApiConfig();
    if (adminConfig) {
      setApiKey(adminConfig.apiKey);
      setModel(adminConfig.model);
      setIsAdmin(true);
      
      // Fetch available models for admin
      fetchModels(adminConfig.apiKey);
      return;
    }
    
    // Otherwise fall back to user config
    const config = getApiConfig();
    if (config) {
      setApiKey(config.apiKey);
      setModel(config.model);
      
      // Fetch available models
      if (config.apiKey) {
        fetchModels(config.apiKey);
      }
    }
  }, [open]);

  const fetchModels = async (key: string) => {
    try {
      const models = await getAvailableModels(key);
      setAvailableModels(models);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your OpenRouter API key");
      return;
    }

    setIsLoading(true);
    
    // Create the config
    const config: ApiConfig = {
      apiKey: apiKey.trim(),
      model
    };
    
    if (isAdmin) {
      // If admin mode, verify password (for simplicity, we're using a static password)
      // In a real app, you'd want a more secure authentication mechanism
      if (adminPassword.trim() === "admin123") {
        saveAdminApiConfig(config);
        toast.success("Admin API configuration saved successfully!");
      } else {
        toast.error("Invalid admin password");
        setIsLoading(false);
        return;
      }
    } else {
      // Regular user config
      saveApiConfig(config);
      toast.success("API configuration saved successfully!");
    }
    
    onApiConfigSaved(config);
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleModelChange = (value: string) => {
    setModel(value);
  };

  const handleAdminModeToggle = (checked: boolean) => {
    setIsAdmin(checked);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminPassword(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">API Configuration</DialogTitle>
          <DialogDescription>
            Enter your OpenRouter API key to connect to OpenAI models.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="admin-mode" 
              checked={isAdmin} 
              onCheckedChange={handleAdminModeToggle}
            />
            <Label htmlFor="admin-mode">Admin Mode</Label>
          </div>
          
          {isAdmin && (
            <div className="grid gap-2">
              <Label htmlFor="adminPassword">Admin Password</Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={handlePasswordChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter admin password to save this API key for all users.
              </p>
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="apiKey">OpenRouter API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={handleApiKeyChange}
              className="transition-all"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get an API key from <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenRouter</a>
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={handleModelChange}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((modelOption) => (
                  <SelectItem key={modelOption} value={modelOption}>
                    {modelOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : (isAdmin ? "Save Admin Configuration" : "Save Configuration")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
