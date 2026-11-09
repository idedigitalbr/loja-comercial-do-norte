import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const officialBrands = [
  {
    name: 'Fasapel',
    slug: 'fasapel',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-fasapel.png',
    description: 'Papéis toalha interfolhados, guardanapos e bobinas de alta absorção para food service e higiene.',
  },
  {
    name: 'Fonteplast',
    slug: 'fonteplast',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-fonteplast.png',
    description: 'Sacolas plásticas reforçadas, bobinas picotadas e embalagens flexíveis para comércio e atacado.',
  },
  {
    name: 'Knauf',
    slug: 'knauf',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-knauf.png',
    description: 'Caixas térmicas em EPS (isopor), isolamento de temperatura e embalagens conservadoras para alimentos e bebidas.',
  },
  {
    name: 'Lanchero',
    slug: 'lanchero',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-lanchero.png',
    description: 'Hamburgueiras, caixas para porções, barcas para lanche e embalagens térmicas práticas para delivery.',
  },
  {
    name: 'Plasan',
    slug: 'plasan',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-plasan.png',
    description: 'Potes redondos, retangulares e tampas herméticas com fechamento seguro para molhos, sobremesas e alimentos.',
  },
  {
    name: 'Prafesta',
    slug: 'prafesta',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-prafesta.png',
    description: 'Potes descartáveis resistentes a freezer e micro-ondas, marmitas práticas e descartáveis premium para festas.',
  },
  {
    name: 'Segplast',
    slug: 'segplast',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-segplast.png',
    description: 'Filmes plásticos esticáveis, filmes de PVC culinário, fitas adesivas e soluções em fechamento seguro.',
  },
  {
    name: 'Sicao',
    slug: 'sicao',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-sicao.png',
    description: 'Chocolates nobres, coberturas fracionadas em gotas e barras, gotas forneáveis e cacau em pó da linha Barry Callebaut.',
  },
  {
    name: 'Techplast',
    slug: 'techplast',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-techplast.png',
    description: 'Copos plásticos PP e PS de alta transparência, pratos e talheres descartáveis resistentes para buffets e eventos.',
  },
  {
    name: 'Totalplast',
    slug: 'totalplast',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-totalplast.png',
    description: 'Copos térmicos, pratos térmicos, bandejas de isopor e embalagens EPS com conservação máxima de temperatura.',
  },
  {
    name: 'Ultra Descartáveis',
    slug: 'ultra-descartaveis',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-ultradescartaveis.png',
    description: 'Copos ultra resistentes, copos para chopp e açaí, potes bolha e descartáveis reforçados de primeira linha.',
  },
  {
    name: 'Vipel',
    slug: 'vipel',
    imagePath: '/assets/PRODUTOS/marcas-imgs/marca-vipel.png',
    description: 'Sacos de papel kraft para delivery, sacolas ecológicas com alça, bobinas de papel e embalagens biodegradáveis.',
  },
];

const officialSubbrands = [
  { name: 'Guardanapos & Toalhas', slug: 'fasapel-guardanapos-toalhas', parentSlug: 'fasapel' },
  { name: 'Papel Higiênico Institucional', slug: 'fasapel-papel-institucional', parentSlug: 'fasapel' },
  { name: 'Sacolas Alça Camiseta', slug: 'fonteplast-sacolas-camiseta', parentSlug: 'fonteplast' },
  { name: 'Bobinas Picotadas Fundo Estrela', slug: 'fonteplast-bobinas-picotadas', parentSlug: 'fonteplast' },
  { name: 'Caixas Térmicas EPS', slug: 'knauf-caixas-termicas', parentSlug: 'knauf' },
  { name: 'Marmitas & Discos Térmicos', slug: 'knauf-marmitas-discos', parentSlug: 'knauf' },
  { name: 'Hamburgueiras & Sanduíches', slug: 'lanchero-hamburgueiras', parentSlug: 'lanchero' },
  { name: 'Barcas & Embalagens de Porção', slug: 'lanchero-barcas-porcoes', parentSlug: 'lanchero' },
  { name: 'Potes Herméticos com Tampa', slug: 'plasan-potes-hermeticos', parentSlug: 'plasan' },
  { name: 'Recipientes & Molheiras', slug: 'plasan-recipientes-molheiras', parentSlug: 'plasan' },
  { name: 'Linha Freezer & Micro-ondas', slug: 'prafesta-freezer-microondas', parentSlug: 'prafesta' },
  { name: 'Artigos de Festa & Refeição', slug: 'prafesta-artigos-festa', parentSlug: 'prafesta' },
  { name: 'Filmes Stretch & PVC', slug: 'segplast-filmes-stretch-pvc', parentSlug: 'segplast' },
  { name: 'Fitas Adesivas & Lacres', slug: 'segplast-fitas-adesivas', parentSlug: 'segplast' },
  { name: 'Chocolates Nobres & Barras', slug: 'sicao-chocolates-barras', parentSlug: 'sicao' },
  { name: 'Gotas Forneáveis & Coberturas', slug: 'sicao-gotas-coberturas', parentSlug: 'sicao' },
  { name: 'Copos PP & PS Descartáveis', slug: 'techplast-copos-descartaveis', parentSlug: 'techplast' },
  { name: 'Pratos & Talheres Reforçados', slug: 'techplast-pratos-talheres', parentSlug: 'techplast' },
  { name: 'Copos & Potes Térmicos EPS', slug: 'totalplast-copos-potes-termicos', parentSlug: 'totalplast' },
  { name: 'Bandejas & Discos de Isopor', slug: 'totalplast-bandejas-isopor', parentSlug: 'totalplast' },
  { name: 'Copos Ultra Cristal & Chopp', slug: 'ultra-descartaveis-copos-cristal', parentSlug: 'ultra-descartaveis' },
  { name: 'Potes Bolha & Sobremesa', slug: 'ultra-descartaveis-potes-bolha', parentSlug: 'ultra-descartaveis' },
  { name: 'Sacolas & Sacos Kraft Delivery', slug: 'vipel-sacolas-kraft', parentSlug: 'vipel' },
  { name: 'Bobinas de Papel & Papel Manteiga', slug: 'vipel-papel-culinario-bobinas', parentSlug: 'vipel' },
];

function pickBrandForProduct(name: string, slug: string): string {
  const text = `${name} ${slug}`.toLowerCase();

  // Papel Kraft / Sacos Kraft -> Vipel
  if (text.includes('kraft') || text.includes('papel manteiga') || text.includes('saco de papel')) {
    return 'vipel-sacolas-kraft';
  }

  // Guardanapos, toalhas de papel, papel higiênico -> Fasapel
  if (text.includes('guardanapo') || text.includes('papel toalha') || text.includes('interfolhad') || text.includes('higienic')) {
    return 'fasapel-guardanapos-toalhas';
  }

  // Sacolas plásticas, bobinas plásticas -> Fonteplast
  if (text.includes('sacola plastica') || text.includes('sacola plástica') || text.includes('bobina picotada')) {
    return 'fonteplast-sacolas-camiseta';
  }

  // Copo chopp / açaí / copo bolha -> Ultra Descartáveis
  if (text.includes('chopp') || text.includes('açaí') || text.includes('acai') || text.includes('bolha') || text.includes('ultra')) {
    return text.includes('bolha') ? 'ultra-descartaveis-potes-bolha' : 'ultra-descartaveis-copos-cristal';
  }

  // Isopor térmico, marmita EPS, caixa térmica -> Knauf ou Totalplast
  if (text.includes('caixa termica') || text.includes('caixa térmica')) {
    return 'knauf-caixas-termicas';
  }
  if (text.includes('isopor') || text.includes('termico') || text.includes('térmico') || text.includes('bandeja')) {
    return 'totalplast-bandejas-isopor';
  }

  // Lanche, hamburguer, pizza, barca -> Lanchero
  if (text.includes('hamburguer') || text.includes('hambúrguer') || text.includes('pizza') || text.includes('barca') || text.includes('porcao') || text.includes('porção')) {
    return 'lanchero-hamburgueiras';
  }

  // Potes e molheiras -> Plasan
  if (text.includes('pote') || text.includes('molheira') || text.includes('hermetic')) {
    return 'plasan-potes-hermeticos';
  }

  // Velas, aniversário, artigos de festa -> Prafesta
  if (text.includes('vela') || text.includes('aniversario') || text.includes('aniversário') || text.includes('festa') || text.includes('forminha')) {
    return 'prafesta-artigos-festa';
  }

  // Filme PVC, stretch, fita adesiva, lacre -> Segplast
  if (text.includes('filme') || text.includes('pvc') || text.includes('stretch') || text.includes('fita') || text.includes('lacre')) {
    return 'segplast-filmes-stretch-pvc';
  }

  // Chocolate, calda, confeito, cacau -> Sicao
  if (text.includes('chocolate') || text.includes('cacau') || text.includes('cobertura') || text.includes('leite condensado')) {
    return 'sicao-chocolates-barras';
  }

  // Copos, pratos, talheres descartáveis gerais -> Techplast
  if (text.includes('copo') || text.includes('prato') || text.includes('talher') || text.includes('garfo') || text.includes('faca') || text.includes('colher')) {
    return text.includes('copo') ? 'techplast-copos-descartaveis' : 'techplast-pratos-talheres';
  }

  // Default para alimentos/outros produtos que possuem marca parceira de higiene/geral ou fasapel
  return 'fasapel';
}

async function main() {
  console.log('1. Sincronizando marcas principais...');
  const brandIdBySlug = new Map<string, string>();

  for (const b of officialBrands) {
    const row = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        imagePath: b.imagePath,
        description: b.description,
        status: 'ACTIVE',
      },
      create: {
        name: b.name,
        slug: b.slug,
        imagePath: b.imagePath,
        description: b.description,
        status: 'ACTIVE',
        legacySource: 'OFFICIAL',
        legacyId: b.slug,
      },
    });
    brandIdBySlug.set(b.slug, row.id);
  }

  console.log('2. Sincronizando submarcas...');
  for (const sub of officialSubbrands) {
    const parentId = brandIdBySlug.get(sub.parentSlug);
    if (!parentId) continue;

    const row = await prisma.brand.upsert({
      where: { slug: sub.slug },
      update: {
        name: sub.name,
        parentId,
        status: 'ACTIVE',
      },
      create: {
        name: sub.name,
        slug: sub.slug,
        parentId,
        status: 'ACTIVE',
        legacySource: 'OFFICIAL',
        legacyId: sub.slug,
      },
    });
    brandIdBySlug.set(sub.slug, row.id);
  }

  console.log('3. Reatribuindo produtos para marcas e submarcas oficiais...');
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, brandId: true, brand: { select: { slug: true } } },
  });

  let reassigned = 0;
  for (const p of allProducts) {
    // Se o produto está na tag-exemplo ou sem marca válida oficial
    if (!p.brand || p.brand.slug === 'tag-exemplo' || p.brand.slug === 'marca-exemplo') {
      const targetSlug = pickBrandForProduct(p.name, p.slug);
      const targetBrandId = brandIdBySlug.get(targetSlug);
      if (targetBrandId) {
        await prisma.product.update({
          where: { id: p.id },
          data: { brandId: targetBrandId },
        });
        reassigned += 1;
      }
    }
  }
  console.log(`Reatribuídos ${reassigned} produtos.`);

  console.log('4. Removendo marca obsoleta tag-exemplo...');
  const obsoleteBrand = await prisma.brand.findFirst({
    where: { slug: { in: ['tag-exemplo', 'marca-exemplo'] } },
  });
  if (obsoleteBrand) {
    await prisma.brand.delete({
      where: { id: obsoleteBrand.id },
    });
    console.log('Marca obsoleta tag-exemplo removida.');
  }

  console.log('5. Verificação final de marcas e produtos:');
  const summary = await prisma.brand.findMany({
    where: { parentId: null },
    select: {
      name: true,
      slug: true,
      _count: { select: { products: true, children: true } },
      children: { select: { name: true, slug: true, _count: { select: { products: true } } } },
    },
  });

  for (const root of summary) {
    const subTotal = root.children.reduce((acc, c) => acc + c._count.products, 0);
    console.log(`- ${root.name} (${root._count.products} diretos + ${subTotal} em ${root._count.children} submarcas)`);
  }
}

main()
  .catch((e) => {
    console.error('Erro na sincronização:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
