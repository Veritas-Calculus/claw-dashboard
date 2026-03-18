import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as d3 from 'd3'
import { Card } from '@/components/common'
import { StatusDot } from '@/components/common/Badge'
import { topoNodes, topoEdges, type TopoNode } from '@/lib/topology'
import styles from './Topology.module.css'

const typeColors: Record<TopoNode['type'], string> = {
  orchestrator: '#bf5af2',
  worker: '#0a84ff',
  service: '#30d158',
  external: '#ff9f0a',
}

const statusToColor: Record<TopoNode['status'], string> = {
  active: '#30d158',
  idle: '#64d2ff',
  error: '#ff453a',
  offline: '#86868b',
}

interface SimNode extends d3.SimulationNodeDatum, TopoNode {}
interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  label?: string
  weight: number
}

export default function Topology() {
  const { t } = useTranslation()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<TopoNode | null>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = Math.max(500, container.clientHeight)

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${width} ${height}`)

    // Defs — arrowheads
    const defs = svg.append('defs')
    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 28)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', 'var(--color-text-tertiary)')

    // Build simulation data
    const nodes: SimNode[] = topoNodes.map((n) => ({ ...n }))
    const links: SimLink[] = topoEdges.map((e) => ({
      source: e.source,
      target: e.target,
      label: e.label,
      weight: e.weight,
    }))

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(120),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(40))

    // Edges
    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'var(--color-border)')
      .attr('stroke-width', (d) => Math.max(1, d.weight / 3))
      .attr('stroke-opacity', 0.5)
      .attr('marker-end', 'url(#arrowhead)')

    // Edge labels
    const linkLabel = svg
      .append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .text((d) => d.label ?? '')
      .attr('font-size', 9)
      .attr('fill', 'var(--color-text-tertiary)')
      .attr('text-anchor', 'middle')
      .attr('dy', -4)

    // Node groups
    const nodeGroup = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        // d3.drag typing doesn't perfectly match Selection.call — safe cast needed
        d3.drag<SVGGElement, SimNode>()
          .on('start', (event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }) as any,
      )
      .on('click', (_, d) => {
        setSelectedNode(d)
      })

    // Node circles
    nodeGroup
      .append('circle')
      .attr('r', (d) => (d.type === 'orchestrator' ? 22 : d.type === 'external' ? 16 : 18))
      .attr('fill', (d) => typeColors[d.type])
      .attr('fill-opacity', 0.15)
      .attr('stroke', (d) => typeColors[d.type])
      .attr('stroke-width', 2)

    // Status ring
    nodeGroup
      .append('circle')
      .attr('r', (d) => (d.type === 'orchestrator' ? 25 : d.type === 'external' ? 19 : 21))
      .attr('fill', 'none')
      .attr('stroke', (d) => statusToColor[d.status])
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d) => (d.status === 'offline' ? '4,3' : 'none'))
      .attr('stroke-opacity', 0.7)

    // Node labels
    nodeGroup
      .append('text')
      .text((d) => d.name)
      .attr('font-size', 10)
      .attr('fill', 'var(--color-text-primary)')
      .attr('text-anchor', 'middle')
      .attr('dy', 36)
      .attr('font-weight', 500)

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimNode).x!)
        .attr('y1', (d) => (d.source as SimNode).y!)
        .attr('x2', (d) => (d.target as SimNode).x!)
        .attr('y2', (d) => (d.target as SimNode).y!)

      linkLabel
        .attr('x', (d) => ((d.source as SimNode).x! + (d.target as SimNode).x!) / 2)
        .attr('y', (d) => ((d.source as SimNode).y! + (d.target as SimNode).y!) / 2)

      nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [])

  const connectedEdges = selectedNode
    ? topoEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
    : []

  return (
    <div id="topology-page" className={styles.page}>
      <h1 className={styles.pageTitle}>{t('nav.topology')}</h1>

      <div className={styles.layout}>
        <Card className={styles.graphCard}>
          <div ref={containerRef} className={styles.graphContainer}>
            <svg ref={svgRef} className={styles.graphSvg} />
          </div>
          <div className={styles.legend}>
            {Object.entries(typeColors).map(([type, color]) => (
              <span key={type} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: color }} />
                {type}
              </span>
            ))}
          </div>
        </Card>

        {selectedNode && (
          <Card className={styles.detailPanel}>
            <h3 className={styles.detailTitle}>{selectedNode.name}</h3>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusDot status={selectedNode.status} />
                {selectedNode.status}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Type</span>
              <span style={{ color: typeColors[selectedNode.type], fontWeight: 600 }}>
                {selectedNode.type}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Connections</span>
              <span>{connectedEdges.length}</span>
            </div>
            <div className={styles.connectionList}>
              {connectedEdges.map((e, i) => (
                <div key={i} className={styles.connectionItem}>
                  <span>{e.source === selectedNode.id ? e.target : e.source}</span>
                  <span className={styles.connectionLabel}>{e.label}</span>
                  <span className={styles.connectionWeight}>{e.weight}x</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
