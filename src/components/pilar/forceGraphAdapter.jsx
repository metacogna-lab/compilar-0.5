/**
 * Adapter for ForceConnectionGraph2
 * Maps force connection data to pillar structures for visualization
 */

import { pillarsInfo } from './pillarsData';
import { forceConnectionsData } from './forceConnectionsData';

export function adaptForceGraphData(mode) {
  const currentPillars = pillarsInfo[mode] || [];
  const modeCapitalized = mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical';
  
  // Create title-to-ID mapping
  const titleToIdMap = {};
  currentPillars.forEach(pillar => {
    titleToIdMap[pillar.title] = pillar.id;
  });

  // Get connections for current mode and map titles to IDs
  const rawConnections = forceConnectionsData?.forces || [];
  const connections = rawConnections
    .filter(f => f.mode === modeCapitalized)
    .map(conn => ({
      ...conn,
      fromPillarId: titleToIdMap[conn.force_from],
      toPillarId: titleToIdMap[conn.force_to]
    }))
    .filter(conn => conn.fromPillarId && conn.toPillarId); // Only valid connections

  // Create pillar positions (pentagon layout)
  const pillarPositions = {};
  currentPillars.forEach((pillar, idx) => {
    const angle = (idx / currentPillars.length) * 2 * Math.PI - Math.PI / 2;
    const radius = 35;
    pillarPositions[pillar.id] = {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    };
  });

  // Group connections by source pillar
  const connectionsByPillar = {};
  connections.forEach(conn => {
    if (!connectionsByPillar[conn.fromPillarId]) {
      connectionsByPillar[conn.fromPillarId] = [];
    }
    connectionsByPillar[conn.fromPillarId].push(conn);
  });

  // Count connections between each pair of pillars
  const connectionCounts = {};
  connections.forEach(conn => {
    const key = `${conn.fromPillarId}-${conn.toPillarId}`;
    if (!connectionCounts[key]) {
      connectionCounts[key] = 0;
    }
    connectionCounts[key]++;
  });

  return {
    pillars: currentPillars,
    connections,
    pillarPositions,
    connectionsByPillar,
    connectionCounts,
    titleToIdMap,
    mode
  };
}

export function getConnectionPath(fromPos, toPos, index, total) {
  if (!fromPos || !toPos) return '';
  
  const x1 = fromPos.x;
  const y1 = fromPos.y;
  const x2 = toPos.x;
  const y2 = toPos.y;
  
  // Offset multiple connections between same pillars
  const offsetFactor = total > 1 ? (index - (total - 1) / 2) * 0.04 : 0;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const offsetX = (y2 - y1) * offsetFactor;
  const offsetY = (x1 - x2) * offsetFactor;
  
  return `M ${x1} ${y1} Q ${midX + offsetX} ${midY + offsetY} ${x2} ${y2}`;
}

export function getConnectionColor(pillarId, pillars) {
  const pillar = pillars.find(p => p.id === pillarId);
  
  const colorMap = {
    violet: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#4F46E5',
    emerald: '#10B981',
    amber: '#F59E0B'
  };
  
  return colorMap[pillar?.color] || '#8B5CF6';
}