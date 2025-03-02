import React, { useState } from 'react';
import { Send, User, Bot, Plus, Settings, Trash2, Download, Sparkles } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import Sidebar from './components/Sidebar';
import { Message, Conversation } from './types';

function App() {
  const [input, setInput] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', title: 'New Chat', messages: [] },
    { id: '2', title: 'React Components', messages: [] },
    { id: '3', title: 'TypeScript Help', messages: [] },
  ]);
  const [activeConversation, setActiveConversation] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'system', content: 'Hello! How can I help you today?', timestamp: new Date() },
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `This is a simulated response to: "${input}"`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
    
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: 'New Chat',
      messages: []
    };
    
    setConversations([...conversations, newConversation]);
    setActiveConversation(newId);
    setMessages([{ id: '1', role: 'system', content: 'Hello! How can I help you today?', timestamp: new Date() }]);
  };

  const deleteConversation = (id: string) => {
    // Don't delete if it's the last conversation
    if (conversations.length <= 1) {
      return;
    }
    
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    
    // If the active conversation is deleted, switch to the first available conversation
    if (id === activeConversation) {
      const newActiveId = updatedConversations[0]?.id;
      if (newActiveId) {
        setActiveConversation(newActiveId);
        setMessages([{ id: '1', role: 'system', content: 'Hello! How can I help you today?', timestamp: new Date() }]);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        conversations={conversations}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
        createNewChat={createNewChat}
        deleteConversation={deleteConversation}
      />

      {/* Main Content */}
      <div className={`flex flex-col flex-1 transition-all ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white p-4 shadow-sm flex justify-between items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
          <h1 className="text-xl font-semibold">
            {conversations.find(c => c.id === activeConversation)?.title || 'Chat'}
          </h1>
          <div className="flex gap-2">
            <button className="p-2 rounded-md hover:bg-gray-100">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <button
              onClick={handleSendMessage}
              disabled={input.trim() === ''}
              className={`absolute right-3 bottom-3 p-2 rounded-md ${
                input.trim() === '' ? 'text-gray-400' : 'text-blue-500 hover:bg-blue-50'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>
              {/* Placeholder for future features like character count, etc. */}
              {/* Space for additional features */}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;