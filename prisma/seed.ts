import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  ['products.write', 'Criar e editar produtos'],
  ['inventory.adjust', 'Ajustar estoque'],
  ['orders.update', 'Atualizar pedidos'],
  ['payments.refund', 'Solicitar reembolso'],
  ['promotions.publish', 'Publicar promoções'],
  ['reports.financial', 'Visualizar relatórios financeiros'],
] as const;

async function main(): Promise<void> {
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  for (const [code, description] of permissions) {
    const permission = await prisma.permission.upsert({
      where: { code },
      update: { description },
      create: { code, description },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  await prisma.vipTier.createMany({
    data: [
      { name: 'Bronze', rank: 1, discountBps: 0 },
      { name: 'Prata', rank: 2, discountBps: 500 },
      { name: 'Ouro', rank: 3, discountBps: 1000 },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
