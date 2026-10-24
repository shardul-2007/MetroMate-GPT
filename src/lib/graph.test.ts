import { describe, it, expect } from 'vitest';
import {
  getPilotStation,
  calculateRoute,
  compareAllRoutes,
  validateQrPayload,
  sampleQrPayloads,
  Station,
} from './graph';

describe('Station Graph Navigation & Dijkstra Algorithm', () => {
  const station = getPilotStation();

  it('loads pilot station with valid nodes and edges', () => {
    expect(station.id).toBe('pune-central');
    expect(station.nodes.length).toBeGreaterThanOrEqual(10);
    expect(station.edges.length).toBeGreaterThanOrEqual(10);
    for (const node of station.nodes) {
      expect(node.id).toBeDefined();
      expect(node.label).toBeDefined();
      expect(node.level).toBeDefined();
    }
  });

  it('calculates fastest route from entrance-north to platform-1', () => {
    const route = calculateRoute(station, 'entrance-north', 'platform-1', 'fastest');
    expect(route.edges.length).toBeGreaterThan(0);
    expect(route.totalDistanceM).toBeGreaterThan(0);
    expect(route.totalTimeSec).toBeGreaterThan(0);
    expect(route.edges[0].from).toBe('entrance-north');
    expect(route.edges[route.edges.length - 1].to).toBe('platform-1');
  });

  it('calculates least-walking route from entrance-north to platform-1', () => {
    const fastest = calculateRoute(station, 'entrance-north', 'platform-1', 'fastest');
    const leastWalking = calculateRoute(station, 'entrance-north', 'platform-1', 'least-walking');
    expect(leastWalking.edges.length).toBeGreaterThan(0);
    expect(leastWalking.totalDistanceM).toBeLessThanOrEqual(fastest.totalDistanceM + 10);
  });

  it('respects step-free accessibility constraints strictly', () => {
    // From entrance-south to platform-1:
    // Direct entrance-south to concourse has stairs: true, stepFree: false
    // Step-free route MUST use entrance-south -> lift-concourse (ramp + lift)
    const stepFree = calculateRoute(station, 'entrance-south', 'platform-1', 'step-free');
    expect(stepFree.edges.length).toBeGreaterThan(0);
    expect(stepFree.isStepFree).toBe(true);
    expect(stepFree.hasStairs).toBe(false);

    // Verify no edge in the step-free path contains stairs
    for (const edge of stepFree.edges) {
      expect(edge.stairs).toBe(false);
    }
  });

  it('calculates fewer-stairs preference and favors escalators or lifts over staircases', () => {
    const fewerStairs = calculateRoute(station, 'entrance-south', 'platform-2', 'fewer-stairs');
    expect(fewerStairs.edges.length).toBeGreaterThan(0);
    expect(fewerStairs.stairFlightCount).toBeLessThanOrEqual(1);
  });

  it('handles same start and destination gracefully', () => {
    const route = calculateRoute(station, 'concourse', 'concourse', 'fastest');
    expect(route.edges.length).toBe(0);
    expect(route.totalDistanceM).toBe(0);
    expect(route.isStepFree).toBe(true);
  });

  it('handles invalid or non-existent location without crashing', () => {
    const route = calculateRoute(station, 'invalid-node-id', 'platform-1', 'fastest');
    expect(route.edges.length).toBe(0);
    expect(route.unreachableMessage).toBeDefined();
  });

  it('handles disconnected nodes safely', () => {
    // Artificial test station with disconnected node
    const disconnectedStation: Station = {
      ...station,
      nodes: [...station.nodes, { id: 'isolated-island', type: 'concourse', label: 'Isolated Node', level: 'L9' }],
    };
    const route = calculateRoute(disconnectedStation, 'entrance-north', 'isolated-island', 'fastest');
    expect(route.edges.length).toBe(0);
    expect(route.unreachableMessage).toContain('No navigable path');
  });

  it('simulates step-by-step progression through all route edges', () => {
    const route = calculateRoute(station, 'entrance-north', 'platform-1', 'fastest');
    expect(route.edges.length).toBeGreaterThan(1);

    // Simulate stepping forward
    let currentIdx = 0;
    while (currentIdx < route.edges.length) {
      const edge = route.edges[currentIdx];
      expect(edge.instruction).toBeDefined();
      expect(edge.distanceM).toBeGreaterThan(0);
      currentIdx++;
    }
    expect(currentIdx).toBe(route.edges.length);
  });
});

describe('Station QR Code Payload Validation', () => {
  it('validates a valid JSON QR payload', () => {
    const payload = JSON.stringify({
      system: 'pune-metro',
      stationId: 'pune-central',
      nodeId: 'entrance-north',
    });
    const result = validateQrPayload(payload);
    expect(result.valid).toBe(true);
    expect(result.station?.id).toBe('pune-central');
    expect(result.node?.id).toBe('entrance-north');
  });

  it('validates URI format METROMATE:stationId:nodeId', () => {
    const result = validateQrPayload('METROMATE:pune-central:ticket-counter');
    expect(result.valid).toBe(true);
    expect(result.node?.id).toBe('ticket-counter');
  });

  it('validates compact colon format stationId:nodeId', () => {
    const result = validateQrPayload('pune-central:platform-2');
    expect(result.valid).toBe(true);
    expect(result.node?.id).toBe('platform-2');
  });

  it('rejects empty or whitespace payload', () => {
    expect(validateQrPayload('').valid).toBe(false);
    expect(validateQrPayload('   ').valid).toBe(false);
  });

  it('rejects unparseable or unrecognized format', () => {
    const result = validateQrPayload('unknown-random-barcode-12345');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects unknown station ID', () => {
    const result = validateQrPayload(
      JSON.stringify({ system: 'pune-metro', stationId: 'jaipur-central', nodeId: 'entrance-north' })
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('jaipur-central');
  });

  it('rejects unknown node ID in valid station', () => {
    const result = validateQrPayload(
      JSON.stringify({ system: 'pune-metro', stationId: 'pune-central', nodeId: 'non-existent-gate-99' })
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('non-existent-gate-99');
  });

  it('verifies that all sample demo QR payloads are valid and resolve accurately', () => {
    for (const sample of sampleQrPayloads) {
      const result = validateQrPayload(sample.payload);
      expect(result.valid).toBe(true);
      expect(result.node).toBeDefined();
      expect(result.station?.id).toBe('pune-central');
    }
  });
});
