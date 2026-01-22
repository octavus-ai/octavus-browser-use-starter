import { notFound } from 'next/navigation';
import { ChatInterface } from '@/features/chat';
import { getOctavusClient } from '@/lib/octavus';

interface ChatPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { sessionId } = await params;

  if (!sessionId) {
    notFound();
  }

  // Validate session exists by fetching it
  const client = getOctavusClient();

  let session;
  try {
    session = await client.agentSessions.get(sessionId);
  } catch {
    notFound();
  }

  return <ChatInterface sessionId={sessionId} agentId={session.agentId} />;
}
