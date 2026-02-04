'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/useAuthState';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MessageThread, ConversationListItem } from '@/components/messaging/MessageThread';
import { getActiveCampaign, getConversations, getMessages, sendMessage, markMessagesAsRead, getUnreadCount } from '@/lib/api-campaign';
import { MessageCircle, Lock, Clock, Heart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuthState();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [messagingLocked, setMessagingLocked] = useState(false);
  const [lockReason, setLockReason] = useState('');

  // Load campaign and conversations
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    const loadData = async () => {
      try {
        const campaignRes = await getActiveCampaign();
        if (!campaignRes.success || !campaignRes.data) {
          setMessagingLocked(true);
          setLockReason('No active campaign found');
          return;
        }

        const isAdmin = user?.email === 'kurtgavin.design@gmail.com';
        const phase = campaignRes.data.phase;

        // For testing/demo purposes, and since we are in "Wizard Match" mode:
        // Unlock messaging if phase is profile_update, results_released, OR if running in development, OR if the user is an Admin.
        const isDev = process.env.NODE_ENV === 'development';
        // Relaxed condition:
        if (phase !== 'profile_update' && phase !== 'results_released' && !isAdmin && !isDev) {
          setMessagingLocked(true);
          const phaseMessages: Record<string, string> = {
            pre_launch: 'Messaging opens when the matching period begins',
            survey_open: 'Complete your survey first! Messaging opens during the profile update period',
            survey_closed: 'Matching is in progress. Messaging opens soon!',
            profile_update: 'Messaging available',
            results_released: 'Messaging available',
          };
          setLockReason(phaseMessages[phase] || 'Messaging is not available yet');
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
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-retro-cream">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-cardinal-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-cream">
      <Header />

      <main className="max-w-7xl mx-auto p-4 pt-32 pb-12">
        {/* Locked state */}
        {messagingLocked ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border-8 border-navy p-12 shadow-[12px_12px_0_0_#1E3A8A] text-center relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(to right, #1E3A8A 2px, transparent 2px),
                    linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)
                  `,
                  backgroundSize: '16px 16px',
                }} />
              </div>

              {/* Lock icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-retro-pink border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]">
                  <Lock className="w-12 h-12 text-navy" />
                </div>
              </div>

              <h1 className="font-pixel text-2xl text-navy mb-4">Messaging Locked 🔒</h1>
              <p className="font-body text-lg text-navy/80 mb-6">{lockReason}</p>

              {/* Timeline */}
              <div className="bg-retro-cream border-4 border-navy p-6 mb-6">
                <h3 className="font-pixel text-sm text-navy mb-4 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  MESSAGING TIMELINE
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-retro-lavender border-2 border-navy flex items-center justify-center flex-shrink-0">
                      <span className="font-pixel text-xs text-navy">1</span>
                    </div>
                    <p className="font-body text-sm text-navy">Complete your survey (Feb 5-10)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-retro-mint border-2 border-navy flex items-center justify-center flex-shrink-0">
                      <span className="font-pixel text-xs text-navy">2</span>
                    </div>
                    <p className="font-body text-sm text-navy">Wait for matching results</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-retro-yellow border-2 border-navy flex items-center justify-center flex-shrink-0">
                      <span className="font-pixel text-xs text-navy">3</span>
                    </div>
                    <p className="font-body text-sm text-navy font-bold">Chat with your matches! (Feb 11+)</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <a href="/survey" className="inline-flex items-center gap-2 bg-retro-pink text-navy px-6 py-3 border-4 border-navy font-pixel text-xs shadow-[6px_6px_0_0_#1E3A8A] hover:shadow-[3px_3px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all">
                  <Heart className="w-4 h-4" />
                  TAKE SURVEY
                </a>
                <a href="/matches" className="inline-flex items-center gap-2 bg-white text-navy px-6 py-3 border-4 border-navy font-pixel text-xs shadow-[6px_6px_0_0_#1E3A8A] hover:shadow-[3px_3px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all">
                  <MessageCircle className="w-4 h-4" />
                  VIEW MATCHES
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Messaging Layout */}
            <div className="flex flex-col mb-8">
              <h1 className="font-pixel text-2xl text-navy mb-2 uppercase">Messages 💬</h1>
              <p className="font-body text-sm text-navy/70">
                {unreadCount > 0 && `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Conversations list */}
              <div className="md:col-span-1">
                <div className="bg-white border-4 border-navy shadow-[6px_6px_0_0_#1E3A8A] overflow-hidden">
                  <div className="p-4 border-b-4 border-navy bg-retro-lavender">
                    <h2 className="font-pixel text-sm text-navy">Your Conversations</h2>
                    <p className="font-body text-xs text-navy/70">{conversations.length} match{conversations.length !== 1 ? 'es' : ''}</p>
                  </div>
                  <div className="divide-y-2 divide-navy max-h-[500px] overflow-y-auto">
                    {conversations.map((conv) => (
                      <ConversationListItem
                        key={conv.matchId}
                        conversation={conv}
                        isActive={selectedConversation?.matchId === conv.matchId}
                        onClick={() => setSelectedConversation(conv)}
                      />
                    ))}
                    {conversations.length === 0 && (
                      <div className="p-8 text-center text-navy/50">
                        <p className="font-body">No conversations yet</p>
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
                    currentUserId={user?.email || ''}
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
                  <div className="bg-white border-4 border-navy shadow-[6px_6px_0_0_#1E3A8A] p-8 text-center">
                    <p className="font-body text-navy/50">Select a conversation to start messaging</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
