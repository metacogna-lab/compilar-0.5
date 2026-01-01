import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { chord, ribbon } from 'd3-chord';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function ForceChordGraph({
  mode,
  allForces = [],
  forceConnections = [],
  selectedForceIds = [],
  hoveredForceId = null,
  onForceSelect,
  onForceHover
}) {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || allForces.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;
    const outerRadius = Math.min(width, height) * 0.4 * zoom;
    const innerRadius = outerRadius - 30;

    // Filter forces by mode
    const modeForcesIds = allForces
      .filter(f => f.modeType === mode || f.modeType === 'neutral')
      .map(f => f.id);

    const modeForces = allForces.filter(f => modeForcesIds.includes(f.id));
    
    // Filter connections for this mode
    const modeConnections = forceConnections.filter(c => 
      c.modeType === mode && 
      modeForcesIds.includes(c.source) && 
      modeForcesIds.includes(c.target)
    );

    // Build matrix for chord diagram
    const forceIndexMap = {};
    modeForces.forEach((f, i) => {
      forceIndexMap[f.id] = i;
    });

    const matrix = Array(modeForces.length).fill(0).map(() => Array(modeForces.length).fill(0));
    
    modeConnections.forEach(conn => {
      const sourceIdx = forceIndexMap[conn.source];
      const targetIdx = forceIndexMap[conn.target];
      if (sourceIdx !== undefined && targetIdx !== undefined) {
        matrix[sourceIdx][targetIdx] = conn.weight || 0.5;
      }
    });

    // Create chord layout
    const chordLayout = chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

    const chords = chordLayout(matrix);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Color scale based on pillar
    const colorMap = {
      'Prospects': '#8B5CF6',
      'Involved': '#EC4899',
      'Liked': '#4F46E5',
      'Agency': '#10B981',
      'Respect': '#F59E0B'
    };

    const getColor = (forceId) => {
      const force = modeForces.find(f => f.id === forceId);
      return force ? (colorMap[force.group] || '#6B7280') : '#6B7280';
    };

    // Draw arcs (forces)
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const group = g.append('g')
      .selectAll('g')
      .data(chords.groups)
      .join('g');

    group.append('path')
      .attr('d', arc)
      .attr('fill', d => getColor(modeForces[d.index]?.id))
      .attr('stroke', d => {
        const force = modeForces[d.index];
        if (selectedForceIds.includes(force?.id)) return '#FFFFFF';
        if (hoveredForceId === force?.id) return '#FFFFFF';
        return 'rgba(255,255,255,0.2)';
      })
      .attr('stroke-width', d => {
        const force = modeForces[d.index];
        if (selectedForceIds.includes(force?.id)) return 3;
        if (hoveredForceId === force?.id) return 2;
        return 1;
      })
      .attr('opacity', d => {
        const force = modeForces[d.index];
        if (selectedForceIds.length === 0) return 0.8;
        if (selectedForceIds.includes(force?.id)) return 1;
        return 0.3;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const force = modeForces[d.index];
        if (force && onForceSelect) {
          onForceSelect(force.id);
        }
      })
      .on('mouseenter', (event, d) => {
        const force = modeForces[d.index];
        if (force && onForceHover) {
          onForceHover(force.id);
        }
      })
      .on('mouseleave', () => {
        if (onForceHover) {
          onForceHover(null);
        }
      });

    // Add labels
    group.append('text')
      .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr('dy', '.35em')
      .attr('transform', d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 10})
        ${d.angle > Math.PI ? 'rotate(180)' : ''}
      `)
      .attr('text-anchor', d => d.angle > Math.PI ? 'end' : 'start')
      .text(d => modeForces[d.index]?.label || '')
      .style('font-size', '11px')
      .style('fill', '#E4E4E7')
      .style('pointer-events', 'none');

    // Draw ribbons (connections)
    const ribbonGenerator = ribbon()
      .radius(innerRadius);

    g.append('g')
      .attr('fill-opacity', 0.6)
      .selectAll('path')
      .data(chords)
      .join('path')
      .attr('d', ribbonGenerator)
      .attr('fill', d => getColor(modeForces[d.source.index]?.id))
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('opacity', d => {
        const sourceForce = modeForces[d.source.index];
        const targetForce = modeForces[d.target.index];
        
        if (selectedForceIds.length === 0) return 0.4;
        
        if (selectedForceIds.includes(sourceForce?.id) || selectedForceIds.includes(targetForce?.id)) {
          return 0.8;
        }
        
        return 0.1;
      })
      .style('pointer-events', 'none');

  }, [allForces, forceConnections, mode, selectedForceIds, hoveredForceId, dimensions, zoom, onForceSelect, onForceHover]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[600px] bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
        >
          <ZoomOut className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Info Label */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
        <p className="text-xs text-zinc-300">
          Click arcs to highlight • Hover for details
        </p>
      </div>

      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
    </div>
  );
}