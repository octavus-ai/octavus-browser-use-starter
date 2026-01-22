/**
 * My Agent Configuration
 *
 * This is an example agent with tool handlers and resources.
 * Customize this file to match your agent's protocol.yaml.
 */

import { Resource, type ToolHandlers } from '@octavus/server-sdk';
import type { AgentConfig } from './types';

// =============================================================================
// Helpers
// =============================================================================

function safeString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

// =============================================================================
// Resources
// =============================================================================

/**
 * Example resource for storing conversation summaries.
 * In a real app, this would persist to a database.
 */
class ConversationSummaryResource extends Resource {
  readonly name = 'CONVERSATION_SUMMARY';

  onUpdate(value: unknown): void {
    console.log(`[Resource Update] ${this.name}:`, value);
    // TODO: Persist to database, send webhook, etc.
  }
}

// =============================================================================
// Tool Handlers
// =============================================================================

const tools: ToolHandlers = {
  /**
   * Example tool: Get user account information.
   * Replace with your actual API/database calls.
   */
  'get-user-account': async (args) => {
    const userId = safeString(args.userId);
    console.log(`[Tool Call] get-user-account: userId=${userId}`);

    // Simulate API/database latency
    await new Promise<void>((resolve) => setTimeout(resolve, 500));

    // TODO: Replace with actual account lookup
    return {
      name: 'Demo User',
      email: 'demo@example.com',
      plan: 'pro',
      createdAt: '2024-01-15T10:30:00Z',
    };
  },

  /**
   * Example tool: Create a support ticket.
   * Replace with your actual ticketing system integration.
   */
  'create-support-ticket': async (args) => {
    const summary = safeString(args.summary);
    const priority = safeString(args.priority);
    console.log(`[Tool Call] create-support-ticket: summary=${summary}, priority=${priority}`);

    // Simulate API latency
    await new Promise<void>((resolve) => setTimeout(resolve, 300));

    // TODO: Replace with actual ticket creation
    const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
    return {
      ticketId,
      estimatedResponse: priority === 'urgent' ? '1 hour' : '24 hours',
    };
  },
};

// =============================================================================
// Export Config
// =============================================================================

/**
 * Agent configuration for "my-agent".
 * Replace the agentId with your actual agent ID from the Octavus platform.
 * You can find this in the agent settings or by running: octavus agents list
 */
export const myAgentConfig: AgentConfig = {
  agentId: process.env.OCTAVUS_AGENT_ID ?? 'your-agent-id-here',
  tools,
  resources: [new ConversationSummaryResource()],
};
