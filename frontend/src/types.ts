export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

// Space for additional types as features are added
export interface ModelSettings {
  temperature?: number;
  maxTokens?: number;
  // Add more model settings as needed
}

export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  fontSize?: 'small' | 'medium' | 'large';
  // Add more user settings as needed
}