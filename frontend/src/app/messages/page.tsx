'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MessageThread, ConversationListItem } from '@/components/messaging/MessageThread';
import { getActiveCampaign, getConversations, getMessages, sendMessage, markMessagesAsRead, getUnreadCount } from '@/lib/api-campaign';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  const sessionResult = useSession();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Handle build-time undefined session
  if (!sessionResult) {
    return null;
  }

  const { data: session, status } = sessionResult;

  // Load campaign and conversations
  useEffect(() => {
    const loadData = async () => {
      try {
        const campaignRes = await getActiveCampaign();
        if (!campaignRes.success || !campaignRes.data) {
          setError('No active campaign found');
          return;
        }

        const phase = campaignRes.data.phase;
        // Only allow messaging during profile_update or results_released
        if (phase !== 'profile_update' && phase !== 'results_released') {
          setError('Messaging is not available yet. It will be unlocked during the profile update period (Feb 11-13).');
          return;
        }

        setCampaign(campaignRes.data);

        const convRes = await getConversations();
        if (convRes.success) {
          setConversations(convRes.data);
          if (convRes.data.length > 0 && !selectedConversation) {
            setSelectedConversation(convRes.data[0]);
          }
        }

        const unreadRes = await getUnreadCount();
        if (unreadRes.success) {
          setUnreadCount(unreadRes.data.unreadCount);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      try {
        const msgRes = await getMessages(selectedConversation.matchId);
        if (msgRes.success) {
          setMessages(msgRes.data);
        }
      } catch (err: any) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();
  }, [selectedConversation]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Messaging Unavailable</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Messages 💬</h1>
              <p className="text-sm text-gray-500">
                {unreadCount > 0 && `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {campaign?.phase === 'profile_update' ? 'Profile Update Period' : 'Valentine\'s Day'}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Conversations list */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Your Conversations</h2>
                <p className="text-sm text-gray-500">{conversations.length} match{conversations.length !== 1 ? 'es' : ''}</p>
              </div>
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {conversations.map((conv) => (
                  <ConversationListItem
                    key={conv.matchId}
                    conversation={conv}
                    isActive={selectedConversation?.matchId === conv.matchId}
                    onClick={() => setSelectedConversation(conv)}
                  />
                ))}
                {conversations.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    <p>No conversations yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message thread */}
          <div className="md:col-span-2">
            {selectedConversation ? (
              <MessageThread
                matchId={selectedConversation.matchId}
                currentUserId={session?.user?.email || ''}
                messages={messages}
                onSendMessage={async (content) => {
                  await sendMessage(selectedConversation.matchId, content);
                  // Reload messages
                  const msgRes = await getMessages(selectedConversation.matchId);
                  if (msgRes.success) {
                    setMessages(msgRes.data);
                  }
                }}
                onMarkAsRead={async (messageIds) => {
                  await markMessagesAsRead(messageIds);
                  setUnreadCount(0);
                }}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-400">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
