// TwitchChat.tsx
import React, { useEffect, useState, useRef } from 'react';
import tmi, { Client } from 'tmi.js';

interface Message {
  user: string;
  text: string;
  timestamp: number;
}

interface TwitchChatProps {
  channel: string;
  isLocked: boolean;
  onJoin: (name: string) => void;
}

const TwitchChat = ({ channel, onJoin, isLocked }: TwitchChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const client: Client = new tmi.Client({
      channels: [channel],
      connection: {
        reconnect: true,
        secure: true,
      },
    });

    client.connect();

    client.on('connected', () => {
      setIsConnected(true);
    });

    client.on('disconnected', () => {
      setIsConnected(false);
    });

    const onMessage = (
      channelName: string,
      tags: tmi.ChatUserstate,
      message: string,
      self: boolean
    ) => {
      if (self) return;

      const name = tags['display-name'] ?? tags.username;

      if (name && !isLocked) {
        onJoin(name);
      }

      setMessages((prev) => [
        ...prev.slice(-49), // Keep last 50 messages
        {
          user: tags['display-name'] || tags.username || 'Unknown',
          text: message,
          timestamp: Date.now(),
        },
      ]);
    };

    client.on('message', onMessage);

    return () => {
      client.removeListener('message', onMessage);
      client.disconnect();
    };
  }, [channel, isLocked, onJoin]);

  return (
    <div className="w-72 max-md:w-full bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-600/50 overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600/80 p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <h3 className="font-semibold text-white text-sm">#{channel}</h3>
          <span className="text-xs text-purple-200">
            ({messages.length})
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:text-purple-200 transition-colors duration-200"
        >
          <svg 
            className={`w-4 h-4 transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Chat Messages */}
      {!isCollapsed && (
        <div className="h-48 max-md:h-40 p-2.5 overflow-y-auto custom-scrollbar">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-4">
              <p>No messages yet</p>
              <p className="text-xs mt-1">Chat will appear here</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {messages.map((msg, idx) => (
                <div key={idx} className="text-xs">
                  <span className="font-semibold text-purple-300">
                    {msg.user}:
                  </span>{' '}
                  <span className="text-gray-200 break-words">
                    {msg.text}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      )}

      {/* Status indicator */}
      {!isCollapsed && (
        <div className="px-2.5 py-1.5 bg-gray-700/50 border-t border-gray-600/50">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-gray-300">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {isLocked && (
              <span className="ml-auto text-red-300 font-medium">🔒 Locked</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TwitchChat;
