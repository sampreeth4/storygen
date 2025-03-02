import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  isOpen: boolean;
  conversations: Conversation[];
  activeConversation: string;
  setActiveConversation: (id: string) => void;
  createNewChat: () => void;
  deleteConversation: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  conversations,
  activeConversation,
  setActiveConversation,
  createNewChat,
  deleteConversation
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={createNewChat}
          className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2">
          <h2 className="text-xs uppercase tracking-wider text-gray-400 px-2 mb-2">Recent Conversations</h2>
          <ul className="space-y-1">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <div className={`flex items-center px-3 py-2 rounded-md ${
                  activeConversation === conversation.id
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-700'
                }`}>
                  <button
                    onClick={() => setActiveConversation(conversation.id)}
                    className="text-left flex-1 truncate"
                  >
                    <span className="truncate">{conversation.title}</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;