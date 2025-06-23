// TwitchChat.tsx
import React, { useEffect, useState } from 'react';
import tmi, { Client } from 'tmi.js';

interface Message {
  user: string;
  text: string;
}

interface TwitchChatProps {
  channel: string;
  isLocked: boolean;
  onJoin: (name: string) => void;
}

const TwitchChat = ({ channel, onJoin, isLocked }: TwitchChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const client: Client = new tmi.Client({
      channels: [channel],
      connection: {
        reconnect: true,
        secure: true,
      },
    });

    client.connect();

    const onMessage = (
      channelName: string,
      tags: tmi.ChatUserstate,
      message: string,
      self: boolean
    ) => {
      if (self) return;

      const name = tags['display-name'] ?? tags.username;

      if (name && !isLocked /* && message.startsWith('!join')*/) {
        onJoin(name);
      }

      setMessages((prev) => [
        ...prev.slice(-49),
        {
          user: tags['display-name'] || tags.username || 'Unknown',
          text: message,
        },
      ]);
    };

    client.on('message', onMessage);

    return () => {
      client.removeListener('message', onMessage); // ✅ CLEAN UP listener
      client.disconnect();
    };
  }, [channel]);

  return (
    <div style={{ height: 150, flexGrow: 1 }}>
      <h2>#{channel} Chat</h2>
      {messages.map((msg, idx) => (
        <div key={idx}>
          <span>{msg.user}:</span> <span>{msg.text}</span>
        </div>
      ))}
    </div>
  );
};

export default TwitchChat;
