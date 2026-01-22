/**
 * Agent Configuration Registry
 *
 * Add new agents by creating a config file and adding to AGENT_CONFIGS.
 */

import type { AgentConfig, AgentConfigRegistry } from './types';
import { myAgentConfig } from './my-agent';

export type { AgentConfig, AgentConfigRegistry } from './types';

// Register your agents here, keyed by agent ID from Octavus platform
const AGENT_CONFIGS: AgentConfig[] = [myAgentConfig];

const configRegistry: AgentConfigRegistry = Object.fromEntries(
  AGENT_CONFIGS.map((config) => [config.agentId, config])
);

export function getAgentConfig(agentId: string): AgentConfig | undefined {
  return configRegistry[agentId];
}

export function getRegisteredAgentIds(): string[] {
  return AGENT_CONFIGS.map((config) => config.agentId);
}
