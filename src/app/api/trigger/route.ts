/**
 * Agent Trigger API Route
 *
 * Proxies trigger requests to the Octavus platform and streams responses.
 * Creates browser tools dynamically to maintain session state.
 */

import type { NextRequest } from 'next/server';
import { toSSEStream } from '@octavus/server-sdk';
import { getOctavusClient } from '@/lib/octavus';
import { getAgentConfig, createBrowserTools } from '@/lib/agents';

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

    // Get agent-specific configuration
    const agentConfig = getAgentConfig(agentId);

    // Create browser tools with session context for state persistence
    const browserTools = createBrowserTools(sessionId);

    // Attach to session with browser tools
    const session = client.agentSessions.attach(sessionId, {
      tools: {
        ...browserTools,
        ...(agentConfig?.tools ?? {}),
      },
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
