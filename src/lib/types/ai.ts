export type ChatMessage = {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
  timestamp?: string;
  imageUrl?: string;
};

export type ChatOptions = {
  model?: string; // Keep as generic string
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string; // For providers that handle it separately
  [key: string]: any; // provider-specific options
};

export type StreamChunk = {
  content: string;
  finished: boolean;
  error?: string;
  totalTokens?: number;
  metadata?: Record<string, any>;
};

export type StreamResult = {
  modelID: string;
  messageID: string;
  fullResponse: string;
  success: boolean;
  error?: string;
  tokenCount?: number;
};

export type ProviderConfig = {
  chatgpt: {
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    role: {
      user: 'user';
      assistant: 'assistant';
      system: 'system';
    };
    imageSupport: true;
  };
  claude: {
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'];
    role: {
      user: 'user';
      assistant: 'assistant';
      system: null;
    };
    imageSupport: true;
  };
  gemini: {
    models: ['gemini-1.5-pro', 'gemini-1.5-flash'];
    role: {
      user: 'user';
      assistant: 'model';
      system: 'system';
    };
    imageSupport: true;
  };
};
