import { create } from 'zustand'

export interface Agent {
  id: string
  name: string
  status: 'active' | 'idle' | 'error' | 'offline'
  cpu: number
  memory: number
  taskCount: number
  lastSeen: string
}

interface AgentState {
  agents: Agent[]
  setAgents: (agents: Agent[]) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
}

export const useAgentStore = create<AgentState>()((set) => ({
  agents: [],
  setAgents: (agents) => set({ agents }),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
}))
