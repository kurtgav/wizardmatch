'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Check, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  isRead: boolean;
  sentAt: Date;
  sender: {
    id: string;
    firstName: string;
    lastName?: string;
    profilePhotoUrl?: string;
  };
}

interface MessageThreadProps {
  matchId: string;
  currentUserId: string;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onMarkAsRead: (messageIds: string[]) => Promise<void>;
  className?: string;
}

export function MessageThread({
  matchId,
  currentUserId,
  messages,
  onSendMessage,
  onMarkAsRead,
  className = '',
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    const unreadMessageIds = messages
      .filter(m => m.senderId !== currentUserId && !m.isRead)
      .map(m => m.id);

    if (unreadMessageIds.length > 0) {
      onMarkAsRead(unreadMessageIds);
    }
  }, [messages, currentUserId, onMarkAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-center">
              No messages yet. Say hi! 👋
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                  {/* Avatar */}
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {message.sender.firstName[0]}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(message.sentAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isOwn && (
                        <span className="text-xs">
                          {message.isRead ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Check className="w-3 h-3 text-gray-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            maxLength={2000}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {newMessage.length}/2000 characters
        </p>
      </div>
    </Card>
  );
}

// Conversation list item component
export function ConversationListItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: {
    matchId: string;
    otherUser: {
      firstName: string;
      lastName?: string;
      profilePhotoUrl?: string;
    };
    lastMessage?: {
      content: string;
      sentAt: Date;
    };
    unreadCount: number;
  };
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b cursor-pointer transition-colors ${
        isActive ? 'bg-pink-50 border-l-4 border-l-pink-500' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center text-white text-lg font-semibold">
            {conversation.otherUser.firstName[0]}
          </div>
          {conversation.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold truncate">
              {conversation.otherUser.firstName} {conversation.otherUser.lastName?.[0]}.
            </h4>
            {conversation.lastMessage && (
              <span className="text-xs text-gray-400">
                {new Date(conversation.lastMessage.sentAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
          {conversation.lastMessage ? (
            <p className="text-sm text-gray-500 truncate">
              {conversation.lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-gray-400">No messages yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
