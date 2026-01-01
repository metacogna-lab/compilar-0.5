/**
 * Canonical data adapter for Assessment workflow
 * Ensures all assessment components use the same data source as PilarInfo and PilarDefinitions
 * Source: pillarsData.js and forceConnectionsData.js
 */

import { pillarsInfo } from '@/components/pilar/pillarsData';
import { forceConnectionsData } from '@/components/pilar/forceConnectionsData';

/**
 * Get pillar data by ID and mode with full names (no abbreviations)
 */
export function getPillarData(pillarId, mode) {
  const pillars = pillarsInfo[mode];
  if (!pillars) return null;
  
  return pillars.find(p => p.id === pillarId);
}

/**
 * Get all pillars for a mode
 */
export function getAllPillars(mode) {
  return pillarsInfo[mode] || [];
}

/**
 * Get forces for a specific pillar (using full pillar title, not abbreviations)
 */
export function getPillarForces(pillarTitle, mode) {
  const modeCapitalized = mode.charAt(0).toUpperCase() + mode.slice(1);
  
  return forceConnectionsData.forces
    .filter(f => 
      f.mode === modeCapitalized && 
      f.force_from === pillarTitle
    )
    .map(f => ({
      id: f.id,
      name: f.name || 'Unnamed Force',
      description: f.description,
      type: f.type,
      effect_type: f.effect_type,
      force_from: f.force_from,
      force_to: f.force_to,
      mode: f.mode
    }));
}

/**
 * Get all forces for a mode
 */
export function getAllForces(mode) {
  const modeCapitalized = mode.charAt(0).toUpperCase() + mode.slice(1);
  
  return forceConnectionsData.forces
    .filter(f => f.mode === modeCapitalized)
    .map(f => ({
      id: f.id,
      name: f.name || 'Unnamed Force',
      description: f.description,
      type: f.type,
      effect_type: f.effect_type,
      force_from: f.force_from,
      force_to: f.force_to,
      mode: f.mode
    }));
}

/**
 * Get force connections between pillars
 */
export function getForceConnections(mode) {
  const modeCapitalized = mode.charAt(0).toUpperCase() + mode.slice(1);
  
  return forceConnectionsData.forces
    .filter(f => f.mode === modeCapitalized)
    .map(f => ({
      id: f.id,
      name: f.name || 'Unnamed Force',
      from: f.force_from,
      to: f.force_to,
      type: f.type,
      description: f.description
    }));
}

/**
 * Get pillar options for card draw (with full names)
 */
export function getPillarDrawOptions() {
  const egalitarian = getAllPillars('egalitarian').map(p => ({
    id: p.id,
    name: p.title, // Full title, not abbreviation
    icon: p.icon,
    description: p.description,
    mode: 'egalitarian',
    fullName: `Egalitarian: ${p.title}` // Full descriptive name
  }));
  
  const hierarchical = getAllPillars('hierarchical').map(p => ({
    id: p.id,
    name: p.title, // Full title, not abbreviation
    icon: p.icon,
    description: p.description,
    mode: 'hierarchical',
    fullName: `Hierarchical: ${p.title}` // Full descriptive name
  }));
  
  return { egalitarian, hierarchical, all: [...egalitarian, ...hierarchical] };
}

/**
 * Format pillar data for revealed card
 */
export function formatRevealedCardData(pillarId, mode) {
  const pillar = getPillarData(pillarId, mode);
  if (!pillar) return null;
  
  const forces = getPillarForces(pillar.title, mode);
  
  return {
    ...pillar,
    forces,
    mode,
    fullName: `${mode.charAt(0).toUpperCase() + mode.slice(1)}: ${pillar.title}`
  };
}

/**
 * Cache for expensive operations (optional, can be implemented later)
 */
const cache = new Map();

export function getCachedPillarData(pillarId, mode) {
  const key = `${pillarId}-${mode}`;
  if (cache.has(key)) return cache.get(key);
  
  const data = getPillarData(pillarId, mode);
  cache.set(key, data);
  return data;
}

export function clearCache() {
  cache.clear();
}