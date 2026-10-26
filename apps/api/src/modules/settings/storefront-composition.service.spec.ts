import { describe, expect, it, vi } from 'vitest';
import { StorefrontCompositionService } from './storefront-composition.service';

const composition = { page: 'home', version: 1, widgets: [{
  id: 'hero', type: 'hero-carousel', enabled: true, order: 0, props: { slides: [] },
}] };
const actor = { id: 'actor-id', publicId: 'actor', email: 'editor@localhost', roles: ['ADMIN'], permissions: ['settings.manage'] };
function setup() {
  const tx = { siteConfiguration: { update: vi.fn().mockResolvedValue({}) }, auditLog: { create: vi.fn().mockResolvedValue({}) } };
  const prisma = {
    $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    auditLog: { findFirst: vi.fn() },
  };
  return { tx, prisma, service: new StorefrontCompositionService(prisma as never) };
}
describe('StorefrontCompositionService', () => {
  it('publishes composition and checkpoint within the same transaction with server-derived identity', async () => {
    const { service, tx, prisma } = setup();
    const result = await service.publish(composition, actor);
    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(tx.siteConfiguration.update).toHaveBeenCalledWith(expect.objectContaining({ data: { homeComposition: composition } }));
    expect(tx.auditLog.create).toHaveBeenCalledWith({ data: expect.objectContaining({ actorId: actor.id, afterJson: result }) });
    expect(result.authorEmail).toBe(actor.email);
  });
  it('propagates checkpoint failure without confirming publication', async () => {
    const { service, tx } = setup();
    tx.auditLog.create.mockRejectedValue(new Error('audit failed'));
    await expect(service.publish(composition, actor)).rejects.toThrow('audit failed');
  });
  it('does not create a checkpoint when site configuration is missing', async () => {
    const { service, tx } = setup();
    tx.siteConfiguration.update.mockRejectedValue(new Error('missing site'));
    await expect(service.publish(composition, actor)).rejects.toThrow('missing site');
    expect(tx.auditLog.create).not.toHaveBeenCalled();
  });
  it.each([{ ...composition, page: 'other' }, { ...composition, widgets: [] }, { ...composition, widgets: [composition.widgets[0], composition.widgets[0]] }])('rejects invalid compositions before persistence', async (input) => {
    const { service, prisma } = setup();
    await expect(service.publish(input, actor)).rejects.toThrow('INVALID_STOREFRONT_COMPOSITION');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  it('records the restoring editor rather than the original author', async () => {
    const { service, prisma } = setup();
    prisma.auditLog.findFirst.mockResolvedValue({ afterJson: { composition, authorEmail: 'previous@localhost' } });
    expect((await service.restore('old-revision', actor)).authorEmail).toBe(actor.email);
  });
  it('rejects unknown checkpoints', async () => {
    const { service, prisma } = setup();
    prisma.auditLog.findFirst.mockResolvedValue(null);
    await expect(service.restore('unknown', actor)).rejects.toThrow('STOREFRONT_REVISION_NOT_FOUND');
  });
});
