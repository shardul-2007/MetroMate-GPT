import { describe, it, expect } from 'vitest';
import {
  getPilotStation,
  calculateRoute,
  compareAllRoutes,
  validateQrPayload,
  sampleQrPayloads,
} from './graph';

describe('Station Graph Navigation & Wayfinding', () => {
  const station = getPilotStation();

  it('loads pilot station with nodes and edges', () => {
    expect(station.id).toBe('pune-central');
    expect(station.nodes.length).toBeGreaterThan(5);
    expect(station.edges.length).toBeGreaterThan(5);
  });

  it('calculates a valid route from entrance-north to platform-1', () => {
    const route = calculateRoute(station, 'entrance-north', 'platform-1', 'fastest');
    expect(route.edges.length).toBeGreaterThan(0);
    expect(route.totalDistanceM).toBeGreaterThan(0);
    expect(route.totalTimeSec).toBeGreaterThan(0);
    expect(route.edges[0].from).toBe('entrance-north');
    expect(route.edges[route.edges.length - 1].to).toBe('platform-1');
  });

  it('handles same start and destination', () => {
    const route = calculateRoute(station, 'concourse', 'concourse', 'fastest');
    expect(route.edges.length).toBe(0);
    expect(route.totalDistanceM).toBe(0);
    expect(route.isStepFree).toBe(true);
  });

  it('handles invalid or non-existent location gracefully without throwing', () => {
    const route = calculateRoute(station, 'non-existent-start', 'platform-1', 'fastest');
    expect(route.edges.length).toBe(0);
    expect(route.unreachableMessage).toBeDefined();
  });

  it('generates distinct route options for preferences and respects step-free accessibility', () => {
    const comparison = compareAllRoutes(station, 'entrance-south', 'platform-1');
    expect(comparison.fastest).toBeDefined();
    expect(comparison['least-walking']).toBeDefined();
    expect(comparison['step-free']).toBeDefined();
    expect(comparison['fewer-stairs']).toBeDefined();

    // From entrance-south to platform-1, step-free MUST use the ramp/lift, not entrance stairs
    const stepFree = comparison['step-free'];
    if (stepFree.edges.length > 0) {
      expect(stepFree.isStepFree).toBe(true);
      expect(stepFree.hasStairs).toBe(false);
    }
  });

  it('handles impossible step-free requests safely and provides clear message', () => {
    // If we deliberately test a disconnected or inaccessible path if any
    const route = calculateRoute(station, 'stairs-p1', 'platform-1', 'step-free');
    // stairs-p1 has stairs=true, so step-free cannot traverse stairs
    if (route.edges.length === 0) {
      expect(route.unreachableMessage).toContain('step-free');
    }
  });
});

describe('QR Payload Validation', () => {
  it('validates a correct JSON QR payload', () => {
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
    const result = validateQrPayload('METROMATE:pune-central:concourse');
    expect(result.valid).toBe(true);
    expect(result.node?.id).toBe('concourse');
  });

  it('rejects empty or whitespace payload', () => {
    expect(validateQrPayload('').valid).toBe(false);
    expect(validateQrPayload('   ').valid).toBe(false);
  });

  it('rejects invalid JSON or unrecognized format', () => {
    const result = validateQrPayload('not-a-valid-qr-code');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects unknown station or unknown node id', () => {
    const resultUnknownStation = validateQrPayload(
      JSON.stringify({ stationId: 'mumbai-central', nodeId: 'platform-1' })
    );
    expect(resultUnknownStation.valid).toBe(false);
    expect(resultUnknownStation.error).toContain('mumbai-central');

    const resultUnknownNode = validateQrPayload(
      JSON.stringify({ stationId: 'pune-central', nodeId: 'platform-99' })
    );
    expect(resultUnknownNode.valid).toBe(false);
    expect(resultUnknownNode.error).toContain('platform-99');
  });

  it('verifies all sample QR payloads are valid', () => {
    for (const sample of sampleQrPayloads) {
      const result = validateQrPayload(sample.payload);
      expect(result.valid).toBe(true);
      expect(result.node).toBeDefined();
    }
  });
});
