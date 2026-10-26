import { vi, describe, expect, it, afterEach, beforeEach } from 'vitest';
import type { INestApplication } from '@nestjs/common';
const { helmetSpy } = vi.hoisted(() => ({ helmetSpy: vi.fn(() => vi.fn()) }));
vi.mock('helmet', () => ({ default: helmetSpy }));
import { configureApp } from './main';
function buildApp() {
 const enableCors = vi.fn();
 const app = { getHttpAdapter: () => ({ getInstance: () => ({ use: vi.fn() }) }), setGlobalPrefix: vi.fn(), enableCors, use: vi.fn(), useGlobalPipes: vi.fn(), useGlobalInterceptors: vi.fn(), useGlobalFilters: vi.fn() } as unknown as INestApplication;
 configureApp(app);
 const options = enableCors.mock.calls[0][0];
 const permits = (origin: string | undefined) => { const callback = vi.fn(); options.origin(origin,callback); return callback.mock.calls[0][1]; };
 return { app, options, permits };
}
describe('API: security headers and actual CORS decisions', () => {
 beforeEach(() => { vi.stubEnv('NODE_ENV','production'); vi.stubEnv('VERCEL',''); });
 afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
 it('limits images to own media, data and local previews and retains YouTube frames', () => {
  buildApp();
  expect(helmetSpy).toHaveBeenCalledWith(expect.objectContaining({contentSecurityPolicy:expect.objectContaining({directives:expect.objectContaining({imgSrc:["'self'",'data:','blob:'],frameSrc:["'self'",'https://www.youtube.com','https://www.youtube-nocookie.com']})})}));
 });
 it('permits official/configured origins with credentials and refuses unknown Vercel hosts', () => {
  vi.stubEnv('APP_ORIGIN','https://configured.example, https://second.example'); vi.stubEnv('ADMIN_ORIGIN','https://admin.example');
  const {options, permits}=buildApp();
  expect(options.credentials).toBe(true);
  for (const origin of ['https://configured.example','https://second.example','https://admin.example','https://loja-comercialdonorte.vercel.app','https://admin-comercialdonorte.vercel.app']) expect(permits(origin)).toBe(true);
  for (const origin of ['https://attacker.vercel.app','https://loja-comercialdonorte.vercel.app.attacker.test','https://attacker.test','http://localhost:9999']) expect(permits(origin)).toBe(false);
 });
 it('uses the official allowlist when env overrides are absent and permits non-browser requests', () => {
  vi.stubEnv('APP_ORIGIN',''); vi.stubEnv('ADMIN_ORIGIN','');
  const {permits}=buildApp();
  expect(permits('https://loja-comercialdonorte.vercel.app')).toBe(true);
  expect(permits('https://attacker.test')).toBe(false);
  expect(permits(undefined)).toBe(true);
 });
 it('allows true loopback origins locally and rejects substring attacks', () => {
  vi.stubEnv('NODE_ENV','test');
  const {permits}=buildApp();
  for (const origin of ['http://localhost:4444','http://127.0.0.1:4444','http://[::1]:4444']) expect(permits(origin)).toBe(true);
  for (const origin of ['https://localhost.attacker.test','https://attacker.test/?127.0.0.1','not-an-origin','https://localhost@attacker.test']) expect(permits(origin)).toBe(false);
 });
 it('never enables localhost convenience on a Vercel runtime', () => {
  vi.stubEnv('NODE_ENV','test'); vi.stubEnv('VERCEL','1'); vi.stubEnv('APP_ORIGIN',''); vi.stubEnv('ADMIN_ORIGIN','');
  expect(buildApp().permits('http://localhost:4444')).toBe(false);
 });
});
