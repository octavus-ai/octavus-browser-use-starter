import { Globe, Camera, MousePointer, FileText } from 'lucide-react';
import { getOctavusClient } from '@/lib/octavus';
import { getDefaultAgentId } from '@/lib/server-config';
import { StartChatButton } from './start-chat-button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">
          Browser Automation Agent
        </h1>
        <p className="mb-8 text-lg text-slate-400">
          Navigate websites, fill forms, take screenshots, and extract
          information using natural language
        </p>

        <StartChatForm />

        <div className="mt-12 text-left">
          <p className="mb-3 text-sm font-medium text-slate-500">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Go to example.com and tell me what you see',
              'Search Google for "octavus ai"',
              'Get the top headlines from Hacker News',
            ].map((example) => (
              <span
                key={example}
                className="rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-300"
              >
                {example}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Globe className="h-6 w-6" />}
            title="Navigate"
            description="Go to any URL and browse the web"
          />
          <FeatureCard
            icon={<MousePointer className="h-6 w-6" />}
            title="Interact"
            description="Click buttons, fill forms, and type text"
          />
          <FeatureCard
            icon={<Camera className="h-6 w-6" />}
            title="Screenshot"
            description="Capture and display page screenshots"
          />
          <FeatureCard
            icon={<FileText className="h-6 w-6" />}
            title="Extract"
            description="Get text and HTML from any page"
          />
        </div>
      </div>
    </main>
  );
}

async function StartChatForm() {
  async function startChat() {
    'use server';

    const client = getOctavusClient();
    const agentId = getDefaultAgentId();

    // Create a new session with the agent
    const sessionId = await client.agentSessions.create(agentId, {
      COMPANY_NAME: 'Acme Inc',
      USER_ID: 'user-123',
    });

    // Redirect to the chat page
    const { redirect } = await import('next/navigation');
    redirect(`/chat/${sessionId}`);
  }

  return (
    <form action={startChat}>
      <StartChatButton />
    </form>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-left">
      <div className="mb-3 inline-flex rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}
