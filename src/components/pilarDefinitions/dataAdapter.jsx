/**
 * Data Adapter for PILAR Intelligence Studio
 * Indexes JSON into fast lookups without graph rendering
 * Read-only, no mutations
 */

export function dataAdapter(frameworkData, connections, mode) {
  const currentMode = frameworkData[mode];
  
  // Extract pillars
  const pillars = Object.entries(currentMode.pillars).map(([key, pillar]) => ({
    ...pillar,
    pillarKey: key,
    type: 'pillar',
    mode: mode
  }));

  // Index by ID
  const byId = {};
  pillars.forEach(p => {
    if (p.id) byId[p.id] = p;
  });

  // Filter connections for current mode
  const modeConnections = connections.filter(c => c.mode === mode);

  // Index connections by entity ID
  const connectionsByEntityId = {};
  modeConnections.forEach(conn => {
    if (!connectionsByEntityId[conn.from]) connectionsByEntityId[conn.from] = [];
    if (!connectionsByEntityId[conn.to]) connectionsByEntityId[conn.to] = [];
    
    connectionsByEntityId[conn.from].push({ ...conn, direction: 'outgoing' });
    connectionsByEntityId[conn.to].push({ ...conn, direction: 'incoming' });
  });

  // Get connected entities for a given entity ID
  const connectedEntities = (entityId) => {
    const conns = connectionsByEntityId[entityId] || [];
    return conns.map(conn => {
      const targetId = conn.direction === 'outgoing' ? conn.to : conn.from;
      return {
        entity: byId[targetId],
        connection: conn,
        direction: conn.direction
      };
    }).filter(c => c.entity); // Filter out missing entities
  };

  // Get depth-2 connections (neighbors of neighbors)
  const depth2Connections = (entityId) => {
    const depth1 = connectedEntities(entityId);
    const depth2Set = new Set();
    const depth2Array = [];

    depth1.forEach(({ entity }) => {
      const neighbors = connectedEntities(entity.id);
      neighbors.forEach(({ entity: neighbor, connection }) => {
        // Avoid returning to the original entity
        if (neighbor.id !== entityId && !depth2Set.has(neighbor.id)) {
          depth2Set.add(neighbor.id);
          depth2Array.push({
            entity: neighbor,
            connection,
            via: entity
          });
        }
      });
    });

    return depth2Array;
  };

  // Map pillar IDs to their keys
  const pillarIdToKey = {};
  Object.entries(currentMode.pillars).forEach(([key, pillar]) => {
    pillarIdToKey[pillar.id] = key;
  });

  // Extract all forces from pillars
  const allForces = [];
  pillars.forEach(pillar => {
    if (pillar.forces && Array.isArray(pillar.forces)) {
      pillar.forces.forEach((force, idx) => {
        allForces.push({
          id: `${pillar.id}_force_${idx}`,
          label: force.name,
          name: force.name,
          description: force.description,
          group: pillarIdToKey[pillar.id] || pillar.pillarKey,
          pillarId: pillar.id,
          pillarConstruct: pillar.construct,
          modeType: mode,
          forceType: force.type || 'discretionary', // reinforce, inverse, or discretionary
          type: 'force'
        });
      });
    }
  });

  // Extract force-level connections from the connections data
  const forceConnections = [];
  modeConnections.forEach(conn => {
    const fromPillar = byId[conn.from];
    const toPillar = byId[conn.to];
    
    if (fromPillar && toPillar) {
      // Create connection between forces of these pillars
      const fromForces = allForces.filter(f => f.pillarId === conn.from);
      const toForces = allForces.filter(f => f.pillarId === conn.to);
      
      // Create connections from each force of the fromPillar to each force of the toPillar
      if (fromForces.length > 0 && toForces.length > 0) {
        fromForces.forEach(fromForce => {
          toForces.forEach(toForce => {
            forceConnections.push({
              source: fromForce.id,
              target: toForce.id,
              weight: conn.weight || 0.5,
              modeType: mode,
              kind: conn.kind,
              description: conn.description,
              label: `${fromForce.label} ${conn.kind} ${toForce.label}`
            });
          });
        });
      }
    }
  });

  return {
    mode,
    displayName: currentMode.displayName,
    summary: currentMode.summary,
    pillars,
    connections: modeConnections,
    allForces,
    forceConnections,
    byId,
    connectionsByEntityId,
    connectedEntities,
    depth2Connections,
    counts: {
      pillars: pillars.length,
      connections: modeConnections.length,
      forces: allForces.length,
      forceConnections: forceConnections.length
    }
  };
}

/**
 * Validate data integrity (non-graph validation only)
 */
export function validateData(adaptedData) {
  const warnings = [];

  // Check for duplicate IDs
  const idCounts = {};
  adaptedData.pillars.forEach(p => {
    if (p.id) {
      idCounts[p.id] = (idCounts[p.id] || 0) + 1;
    }
  });

  Object.entries(idCounts).forEach(([id, count]) => {
    if (count > 1) {
      warnings.push({
        type: 'duplicate_id',
        severity: 'error',
        message: `Duplicate ID found: ${id} (appears ${count} times)`
      });
    }
  });

  // Check for missing referenced IDs in connections
  adaptedData.connections.forEach(conn => {
    if (!adaptedData.byId[conn.from]) {
      warnings.push({
        type: 'missing_entity',
        severity: 'error',
        message: `Connection references missing entity ID: ${conn.from}`
      });
    }
    if (!adaptedData.byId[conn.to]) {
      warnings.push({
        type: 'missing_entity',
        severity: 'error',
        message: `Connection references missing entity ID: ${conn.to}`
      });
    }
  });

  // Check for missing required fields
  adaptedData.pillars.forEach(p => {
    if (!p.id) {
      warnings.push({
        type: 'missing_field',
        severity: 'warning',
        message: `Pillar missing required field 'id': ${p.construct || 'unknown'}`
      });
    }
    if (!p.definition) {
      warnings.push({
        type: 'missing_field',
        severity: 'warning',
        message: `Pillar missing 'definition': ${p.id || 'unknown'}`
      });
    }
  });

  return warnings;
}