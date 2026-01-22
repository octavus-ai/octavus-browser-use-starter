import type { ToolHandlers, Resource } from '@octavus/server-sdk';

/**
 * Configuration for an agent.
 * Includes tool handlers and resources that the agent can use.
 */
export interface AgentConfig {
  /** The agent ID from the Octavus platform */
  agentId: string;
  tools: ToolHandlers;
  resources?: Resource[];
}

export type AgentConfigRegistry = Record<string, AgentConfig>;
