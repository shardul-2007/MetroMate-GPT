import puneMetroData from '../data/stations/pune-metro.json';

export type StationNode = {
  id: string;
  type: 'entrance' | 'ticket' | 'concourse' | 'platform' | 'escalator' | 'stairs' | 'lift' | 'exit';
  label: string;
  level: string;
  direction?: string;
  lat?: number;
  lng?: number;
  landmark?: string;
};

export type StationEdge = {
  from: string;
  to: string;
  distanceM: number;
  timeSec: number;
  stairs: boolean;
  escalator: boolean;
  lift: boolean;
  stepFree: boolean;
  verified: boolean;
  instruction: string;
};

export type Station = {
  id: string;
  name: string;
  line: string;
  status: string;
  nodes: StationNode[];
  edges: StationEdge[];
};

export type NavigationPreference = 'fastest' | 'least-walking' | 'step-free' | 'fewer-stairs';

export type ComputedRoute = {
  preference: NavigationPreference;
  title: string;
  explanation: string;
  edges: StationEdge[];
  totalDistanceM: number;
  totalTimeSec: number;
  hasStairs: boolean;
  stairFlightCount: number;
  hasEscalator: boolean;
  hasLift: boolean;
  isStepFree: boolean;
  isVerified: boolean;
  unreachableMessage?: string;
};

export function getPilotStation(): Station {
  return puneMetroData.stations[0] as Station;
}

export function getAllStations(): Station[] {
  return puneMetroData.stations as Station[];
}

export function getNodeById(station: Station, nodeId: string): StationNode | undefined {
  return station.nodes.find((n) => n.id === nodeId);
}

/** Build adjacency graph with bi-directional support and logical reverse edge instructions */
function buildGraph(station: Station) {
  const adj = new Map<string, StationEdge[]>();
  for (const node of station.nodes) {
    adj.set(node.id, []);
  }

  for (const edge of station.edges) {
    // Forward edge
    adj.get(edge.from)?.push(edge);

    // Reverse edge (walk back)
    const fromNode = getNodeById(station, edge.from);
    const toNode = getNodeById(station, edge.to);
    const reverseInstruction = edge.instruction
      ? `Proceed from ${toNode?.label || edge.to} back towards ${fromNode?.label || edge.from}.`
      : `Walk from ${toNode?.label || edge.to} to ${fromNode?.label || edge.from}.`;

    adj.get(edge.to)?.push({
      from: edge.to,
      to: edge.from,
      distanceM: edge.distanceM,
      timeSec: edge.timeSec,
      stairs: edge.stairs,
      escalator: edge.escalator,
      lift: edge.lift,
      stepFree: edge.stepFree,
      verified: edge.verified,
      instruction: reverseInstruction,
    });
  }

  return adj;
}

/**
 * Dijkstra search based on specific preference edge weights
 */
export function calculateRoute(
  station: Station,
  startNodeId: string,
  destNodeId: string,
  preference: NavigationPreference
): ComputedRoute {
  const startNode = getNodeById(station, startNodeId);
  const destNode = getNodeById(station, destNodeId);

  if (!startNode || !destNode) {
    return {
      preference,
      title: getPreferenceTitle(preference),
      explanation: 'Invalid start or destination location.',
      edges: [],
      totalDistanceM: 0,
      totalTimeSec: 0,
      hasStairs: false,
      stairFlightCount: 0,
      hasEscalator: false,
      hasLift: false,
      isStepFree: false,
      isVerified: false,
      unreachableMessage: 'The selected start or destination is not recognized in this station.',
    };
  }

  if (startNodeId === destNodeId) {
    return {
      preference,
      title: getPreferenceTitle(preference),
      explanation: 'You are already at your destination.',
      edges: [],
      totalDistanceM: 0,
      totalTimeSec: 0,
      hasStairs: false,
      stairFlightCount: 0,
      hasEscalator: false,
      hasLift: false,
      isStepFree: true,
      isVerified: true,
    };
  }

  const adj = buildGraph(station);

  // Cost function per edge
  const getCost = (edge: StationEdge): number => {
    switch (preference) {
      case 'fastest':
        return edge.timeSec;
      case 'least-walking':
        return edge.distanceM;
      case 'step-free':
        // If an edge has stairs or escalators without a lift, it cannot be used for step-free
        if (edge.stairs || (edge.escalator && !edge.lift) || !edge.stepFree) {
          return 999999;
        }
        return edge.timeSec + edge.distanceM;
      case 'fewer-stairs':
        // Heavily penalize stairs, prefer escalators, ramps and lifts
        if (edge.stairs) return edge.timeSec + 500;
        if (edge.escalator || edge.lift) return edge.timeSec * 0.8;
        return edge.timeSec;
      default:
        return edge.timeSec;
    }
  };

  const distances = new Map<string, number>();
  const previousEdge = new Map<string, StationEdge | null>();
  const visited = new Set<string>();

  for (const node of station.nodes) {
    distances.set(node.id, Infinity);
    previousEdge.set(node.id, null);
  }
  distances.set(startNodeId, 0);

  while (visited.size < station.nodes.length) {
    let current: string | null = null;
    let minDistance = Infinity;

    for (const [nodeId, dist] of distances.entries()) {
      if (!visited.has(nodeId) && dist < minDistance) {
        minDistance = dist;
        current = nodeId;
      }
    }

    if (!current || minDistance === Infinity) break;
    if (current === destNodeId) break;

    visited.add(current);

    const neighbors = adj.get(current) || [];
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      const cost = getCost(edge);
      // For step-free, if cost is infinite threshold, do not traverse
      if (preference === 'step-free' && cost >= 999999) continue;

      const alt = minDistance + cost;
      if (alt < (distances.get(edge.to) ?? Infinity)) {
        distances.set(edge.to, alt);
        previousEdge.set(edge.to, edge);
      }
    }
  }

  // Reconstruct path
  const path: StationEdge[] = [];
  let curr = destNodeId;

  while (curr !== startNodeId) {
    const edge = previousEdge.get(curr);
    if (!edge) {
      // No path found
      const unreachableMsg =
        preference === 'step-free'
          ? 'No verified step-free route found between these locations. A section of this path requires stairs. Please consult station staff for assistance.'
          : 'No navigable path found between these two station locations.';
      return {
        preference,
        title: getPreferenceTitle(preference),
        explanation: unreachableMsg,
        edges: [],
        totalDistanceM: 0,
        totalTimeSec: 0,
        hasStairs: false,
        stairFlightCount: 0,
        hasEscalator: false,
        hasLift: false,
        isStepFree: false,
        isVerified: false,
        unreachableMessage: unreachableMsg,
      };
    }
    path.unshift(edge);
    curr = edge.from;
  }

  const totalDistanceM = path.reduce((sum, e) => sum + e.distanceM, 0);
  const totalTimeSec = path.reduce((sum, e) => sum + e.timeSec, 0);
  const stairFlightCount = path.filter((e) => e.stairs).length;
  const hasStairs = stairFlightCount > 0;
  const hasEscalator = path.some((e) => e.escalator);
  const hasLift = path.some((e) => e.lift);
  const isStepFree = path.every((e) => e.stepFree || e.lift);
  const isVerified = path.every((e) => e.verified);

  const explanation = generateRouteExplanation(
    preference,
    totalDistanceM,
    totalTimeSec,
    hasStairs,
    hasEscalator,
    hasLift,
    isStepFree
  );

  return {
    preference,
    title: getPreferenceTitle(preference),
    explanation,
    edges: path,
    totalDistanceM,
    totalTimeSec,
    hasStairs,
    stairFlightCount,
    hasEscalator,
    hasLift,
    isStepFree,
    isVerified,
  };
}

export function compareAllRoutes(
  station: Station,
  startNodeId: string,
  destNodeId: string
): Record<NavigationPreference, ComputedRoute> {
  return {
    fastest: calculateRoute(station, startNodeId, destNodeId, 'fastest'),
    'least-walking': calculateRoute(station, startNodeId, destNodeId, 'least-walking'),
    'step-free': calculateRoute(station, startNodeId, destNodeId, 'step-free'),
    'fewer-stairs': calculateRoute(station, startNodeId, destNodeId, 'fewer-stairs'),
  };
}

function getPreferenceTitle(pref: NavigationPreference): string {
  switch (pref) {
    case 'fastest':
      return 'Fastest Way';
    case 'least-walking':
      return 'Least Walking';
    case 'step-free':
      return 'Step-Free / Accessible';
    case 'fewer-stairs':
      return 'Fewer Stairs';
  }
}

function generateRouteExplanation(
  pref: NavigationPreference,
  distM: number,
  timeSec: number,
  hasStairs: boolean,
  hasEscalator: boolean,
  hasLift: boolean,
  isStepFree: boolean
): string {
  const min = Math.ceil(timeSec / 60);
  switch (pref) {
    case 'fastest':
      return `Optimized for travel time (~${min} min, ${distM} m). Uses the quickest path with escalators where available.`;
    case 'least-walking':
      return `Shortest total walking path (${distM} m, ~${min} min). Direct point-to-point corridor traversal.`;
    case 'step-free':
      return isStepFree
        ? `100% step-free accessible route (${distM} m). Uses ramps and passenger lifts exclusively, avoiding all stairs and escalators.`
        : `Contains stairs or non-level areas. Not fully step-free.`;
    case 'fewer-stairs':
      return hasStairs
        ? `Minimizes stair flights (${distM} m) prioritizing lifts and escalators over physical stair climbing.`
        : `No physical stairs required on this path (${distM} m, ~${min} min).`;
  }
}

/**
 * QR Code Payload Validation
 * Accepts JSON string or formatted string like:
 * METROMATE:pune-central:entrance-north
 * or {"system":"pune-metro","stationId":"pune-central","nodeId":"entrance-north"}
 */
export type QrValidationResult = {
  valid: boolean;
  station?: Station;
  node?: StationNode;
  error?: string;
};

export const sampleQrPayloads = [
  {
    name: 'Gate 1 (North Entrance)',
    payload: JSON.stringify({ system: 'pune-metro', stationId: 'pune-central', nodeId: 'entrance-north' }),
    description: 'Ground floor entrance near bus stand',
  },
  {
    name: 'Concourse AFC Gates',
    payload: JSON.stringify({ system: 'pune-metro', stationId: 'pune-central', nodeId: 'concourse' }),
    description: 'Central ticketing and fare gate hall',
  },
  {
    name: 'Ticket Vending Machines',
    payload: JSON.stringify({ system: 'pune-metro', stationId: 'pune-central', nodeId: 'ticket-machine' }),
    description: 'Automated QR / UPI ticketing zone',
  },
  {
    name: 'Central Glass Lift',
    payload: JSON.stringify({ system: 'pune-metro', stationId: 'pune-central', nodeId: 'lift-concourse' }),
    description: 'Accessible passenger elevator lobby',
  },
  {
    name: 'Platform 2 (Southbound)',
    payload: JSON.stringify({ system: 'pune-metro', stationId: 'pune-central', nodeId: 'platform-2' }),
    description: 'Platform Level 1 towards Swargate',
  },
];

export function validateQrPayload(payload: string): QrValidationResult {
  if (!payload || typeof payload !== 'string' || !payload.trim()) {
    return { valid: false, error: 'Empty or invalid QR code.' };
  }

  const trimmed = payload.trim();
  let stationId = '';
  let nodeId = '';

  // Try JSON parsing
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const data = JSON.parse(trimmed);
      if (typeof data.stationId === 'string' && typeof data.nodeId === 'string') {
        stationId = data.stationId;
        nodeId = data.nodeId;
      } else {
        return { valid: false, error: 'QR JSON missing required stationId or nodeId fields.' };
      }
    } catch {
      return { valid: false, error: 'Malformed JSON payload inside QR code.' };
    }
  } else if (trimmed.startsWith('METROMATE:')) {
    // Format: METROMATE:stationId:nodeId
    const parts = trimmed.split(':');
    if (parts.length >= 3) {
      stationId = parts[1];
      nodeId = parts[2];
    } else {
      return { valid: false, error: 'Invalid METROMATE URI format. Expected METROMATE:stationId:nodeId.' };
    }
  } else if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    stationId = parts[0];
    nodeId = parts[1];
  } else {
    return { valid: false, error: 'Unrecognized QR format. Please use a supported MetroMate QR payload.' };
  }

  const station = getAllStations().find((s) => s.id === stationId);
  if (!station) {
    return { valid: false, error: `Station "${stationId}" is not configured in MetroMate Pune Metro data.` };
  }

  const node = getNodeById(station, nodeId);
  if (!node) {
    return { valid: false, error: `Location "${nodeId}" not found in station "${station.name}".` };
  }

  return { valid: true, station, node };
}
