
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ApiConfig } from '@/types/chat';
import { saveApiConfig, getApiConfig, getUrlParameters } from '@/utils/storage';
import { getAvailableModels } from '@/utils/openai';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiConfigSaved: (config: ApiConfig) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, onOpenChange, onApiConfigSaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai/gpt-4o-mini');
  const [endpoint, setEndpoint] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([
    'openai/gpt-4o-mini',
    'openai/gpt-4o'
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [urlParamsFound, setUrlParamsFound] = useState(false);

  useEffect(() => {
    // Check for URL parameters first
    const urlParams = getUrlParameters();
    if (urlParams.OpenRouterAPI) {
      const apiKey = urlParams.OpenRouterAPI.startsWith('Bearer ') 
        ? urlParams.OpenRouterAPI.substring(7) 
        : urlParams.OpenRouterAPI;
      
      setApiKey(apiKey);
      
      if (urlParams.setModel) {
        setModel(urlParams.setModel);
      }
      
      if (urlParams.OpenAIEndpoint) {
        setEndpoint(urlParams.OpenAIEndpoint);
      }
      
      setUrlParamsFound(true);
      
      // If we have data from URL, save it and close the modal
      const config: ApiConfig = {
        apiKey: apiKey,
        model: urlParams.setModel || 'openai/gpt-4o-mini',
        endpoint: urlParams.OpenAIEndpoint || null
      };
      
      saveApiConfig(config);
      onApiConfigSaved(config);
      fetchModels(apiKey);
      return;
    }
    
    // Otherwise fall back to stored config
    const config = getApiConfig();
    if (config) {
      setApiKey(config.apiKey);
      setModel(config.model);
      setEndpoint(config.endpoint || '');
      
      // Fetch available models
      if (config.apiKey) {
        fetchModels(config.apiKey);
      }
    }
  }, [open, onApiConfigSaved]);

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
      toast.error("Please enter your API key");
      return;
    }

    setIsLoading(true);
    
    // Create the config
    const config: ApiConfig = {
      apiKey: apiKey.trim(),
      model,
      endpoint: endpoint.trim() || null
    };
    
    saveApiConfig(config);
    toast.success("API configuration saved successfully!");
    
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

  const handleEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndpoint(e.target.value);
  };

  // If we got data from URL parameters, don't show the modal
  useEffect(() => {
    if (urlParamsFound && open) {
      onOpenChange(false);
    }
  }, [urlParamsFound, open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">API Configuration</DialogTitle>
          <DialogDescription>
            Enter your API key to connect to the model.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={handleApiKeyChange}
              className="transition-all"
            />
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
          
          <div className="grid gap-2">
            <Label htmlFor="endpoint">API Endpoint (Optional)</Label>
            <Input
              id="endpoint"
              type="text"
              placeholder="Enter API endpoint URL"
              value={endpoint}
              onChange={handleEndpointChange}
              className="transition-all"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
