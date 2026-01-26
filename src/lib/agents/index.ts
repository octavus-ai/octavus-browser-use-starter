/**
 * Agent Configuration Registry
 *
 * For the browser agent, tools are created dynamically per-request
 * to maintain browser session state.
 */

import type { AgentConfig, AgentConfigRegistry } from './types';
import { browserAgentConfig, createBrowserTools } from './browser-agent';

export type { AgentConfig, AgentConfigRegistry } from './types';
export { createBrowserTools } from './browser-agent';

// Register your agents here, keyed by agent ID from Octavus platform
const AGENT_CONFIGS: AgentConfig[] = [browserAgentConfig];

const configRegistry: AgentConfigRegistry = Object.fromEntries(
  AGENT_CONFIGS.map((config) => [config.agentId, config])
);

export function getAgentConfig(agentId: string): AgentConfig | undefined {
  return configRegistry[agentId];
}

export function getRegisteredAgentIds(): string[] {
  return AGENT_CONFIGS.map((config) => config.agentId);
}
