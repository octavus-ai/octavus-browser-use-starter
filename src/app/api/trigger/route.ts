/**
 * Agent Trigger API Route
 *
 * Proxies trigger requests to the Octavus platform and streams responses.
 * This keeps your API key secure on the server.
 */

import type { NextRequest } from 'next/server';
import { toSSEStream } from '@octavus/server-sdk';
import { getOctavusClient } from '@/lib/octavus';
import { getAgentConfig } from '@/lib/agents';

interface TriggerRequest {
  sessionId: string;
  agentId: string;
  triggerName: string;
  input?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TriggerRequest;
    const { sessionId, agentId, triggerName, input } = body;

    if (!sessionId || !agentId || !triggerName) {
      return Response.json(
        { error: 'Missing required fields: sessionId, agentId, triggerName' },
        { status: 400 }
      );
    }

    const client = getOctavusClient();

    // Get agent-specific configuration (tools, resources)
    const agentConfig = getAgentConfig(agentId);

    // Attach to session with agent-specific tools and resources
    const session = client.agentSessions.attach(sessionId, {
      tools: agentConfig?.tools ?? {},
      resources: agentConfig?.resources ?? [],
    });

    const events = session.trigger(triggerName, input, {
      signal: request.signal,
    });

    return new Response(toSSEStream(events), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Trigger error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
