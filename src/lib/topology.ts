/**
 * Mock topology data — defines agent nodes and communication edges.
 */

export interface TopoNode {
  id: string
  name: string
  type: 'orchestrator' | 'worker' | 'service' | 'external'
  status: 'active' | 'idle' | 'error' | 'offline'
}

export interface TopoEdge {
  source: string
  target: string
  label?: string
  weight: number // request volume: 1-10
}

export const topoNodes: TopoNode[] = [
  { id: 'orch', name: 'PipelineOrchestrator', type: 'orchestrator', status: 'active' },
  { id: 'cr', name: 'CodeReviewer', type: 'worker', status: 'active' },
  { id: 'da', name: 'DataAnalyst', type: 'worker', status: 'active' },
  { id: 'tr', name: 'TestRunner', type: 'worker', status: 'idle' },
  { id: 'dw', name: 'DocWriter', type: 'worker', status: 'active' },
  { id: 'ss', name: 'SecurityScanner', type: 'service', status: 'error' },
  { id: 'db', name: 'DeployBot', type: 'service', status: 'idle' },
  { id: 'ca', name: 'ChatAssistant', type: 'worker', status: 'active' },
  { id: 'tl', name: 'Translator', type: 'worker', status: 'idle' },
  { id: 'ip', name: 'ImageProcessor', type: 'service', status: 'offline' },
  { id: 'la', name: 'LogAnalyzer', type: 'service', status: 'active' },
  { id: 'ar', name: 'AlertRouter', type: 'service', status: 'active' },
  { id: 'api', name: 'External API', type: 'external', status: 'active' },
  { id: 'llm', name: 'LLM Gateway', type: 'external', status: 'active' },
]

export const topoEdges: TopoEdge[] = [
  { source: 'orch', target: 'cr', label: 'review', weight: 6 },
  { source: 'orch', target: 'da', label: 'analyze', weight: 4 },
  { source: 'orch', target: 'tr', label: 'test', weight: 5 },
  { source: 'orch', target: 'dw', label: 'docs', weight: 3 },
  { source: 'orch', target: 'ss', label: 'scan', weight: 2 },
  { source: 'orch', target: 'db', label: 'deploy', weight: 3 },
  { source: 'cr', target: 'llm', label: 'inference', weight: 8 },
  { source: 'da', target: 'api', label: 'fetch', weight: 5 },
  { source: 'da', target: 'llm', label: 'inference', weight: 4 },
  { source: 'dw', target: 'llm', label: 'generate', weight: 7 },
  { source: 'ca', target: 'llm', label: 'chat', weight: 9 },
  { source: 'tl', target: 'llm', label: 'translate', weight: 6 },
  { source: 'ss', target: 'api', label: 'cve-db', weight: 3 },
  { source: 'la', target: 'ar', label: 'route', weight: 4 },
  { source: 'ar', target: 'orch', label: 'notify', weight: 2 },
  { source: 'ip', target: 'api', label: 'cdn', weight: 1 },
  { source: 'db', target: 'api', label: 'k8s', weight: 3 },
]
