import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedTestServerAddress } from './run-api-e2e.mjs';

test('allows only loopback outside GitHub Actions', () => {
  assert.equal(isAllowedTestServerAddress('127.0.0.1', {}), true);
  assert.equal(isAllowedTestServerAddress('::1', {}), true);
  assert.equal(isAllowedTestServerAddress('172.20.0.3', {}), false);
  assert.equal(isAllowedTestServerAddress('8.8.8.8', {}), false);
});

test('allows the private Docker bridge only with explicit GitHub Actions opt-in', () => {
  const optedIn = { GITHUB_ACTIONS: 'true', API_TEST_ALLOW_DOCKER: 'true' };
  assert.equal(isAllowedTestServerAddress('172.16.0.1', optedIn), true);
  assert.equal(isAllowedTestServerAddress('172.31.255.254', optedIn), true);
  assert.equal(isAllowedTestServerAddress('172.15.255.255', optedIn), false);
  assert.equal(isAllowedTestServerAddress('172.32.0.1', optedIn), false);
  assert.equal(isAllowedTestServerAddress('10.0.0.2', optedIn), false);
  assert.equal(isAllowedTestServerAddress('192.168.1.2', optedIn), false);
  assert.equal(isAllowedTestServerAddress('8.8.8.8', optedIn), false);
  assert.equal(isAllowedTestServerAddress('172.20.0.3', { GITHUB_ACTIONS: 'true' }), false);
  assert.equal(isAllowedTestServerAddress('172.20.0.3', { API_TEST_ALLOW_DOCKER: 'true' }), false);
});

