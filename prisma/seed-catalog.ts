import { createHash } from 'node:crypto';
import { existsSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import { resolveApiStorageRoot } from '../apps/api/src/modules/files/storage-root';

/**
 * Catálogo de DEMONSTRAÇÃO da Comercial do Norte.
 *
 * - Nenhum dado real de cliente, marca, preço ou depoimento: tudo é exemplo.
 * - `legacySource = SEED_DEMO` marca os registros criados por este seed.
 * - Imagens são geradas localmente (WebP) na storage da API; não há hotlink.
 * - Idempotente: upserts por `slug`/`sku`, seguro para rodar várias vezes.
 */

export const DEMO_SOURCE = 'SEED_DEMO';

type DemoCategory = { name: string; slug: string; parentSlug?: string };

const categories: readonly DemoCategory[] = [
  { name: 'Artigos para Festa', slug: 'artigos-para-festa' },
  { name: 'Embalagens', slug: 'embalagens' },
  { name: 'Descartáveis', slug: 'descartaveis' },
  { name: 'Doces e Bomboniere', slug: 'doces-e-bomboniere' },
  { name: 'Sacos e Sacolas', slug: 'sacos-e-sacolas' },
  { name: 'Produtos de Limpeza', slug: 'produtos-de-limpeza' },
  { name: 'Frios e Laticínios', slug: 'frios-e-laticinios' },
  { name: 'Mercearia', slug: 'mercearia' },
  // Subcategorias de demonstração: exercitam a hierarquia (roadmap E2).
  { name: 'Copos', slug: 'copos', parentSlug: 'descartaveis' },
  { name: 'Pratos', slug: 'pratos', parentSlug: 'descartaveis' },
  { name: 'Caixas e Bandejas', slug: 'caixas-e-bandejas', parentSlug: 'embalagens' },
  { name: 'Filme e Alumínio', slug: 'filme-e-aluminio', parentSlug: 'embalagens' },
  { name: 'Velas e Suprimentos', slug: 'velas-e-suprimentos', parentSlug: 'artigos-para-festa' },
];

type DemoBrand = {
  name: string;
  slug: string;
  imagePath?: string;
  description?: string;
  parentSlug?: string;
};

const brands: readonly DemoBrand[] = [
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
  // Submarcas vinculadas
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

type DemoSegment = {
  name: string;
  slug: string;
  description: string;
  imagePath: string;
  sortOrder: number;
};

const segments: readonly DemoSegment[] = [
  {
    name: 'Lanchonetes & Hamburguerias',
    slug: 'lanchonete',
    description: 'Embalagens térmicas, sacolas, guardanapos, copos e descartáveis para atendimento rápido.',
    imagePath: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-01-lanchonete.jpg',
    sortOrder: 1,
  },
  {
    name: 'Pizzarias & Esfiharias',
    slug: 'pizzaria',
    description: 'Caixas oitavadas e quadradas, lacres, bobinas, sacolas e insumos para delivery seguro.',
    imagePath: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-02-pizzaria.jpg',
    sortOrder: 2,
  },
  {
    name: 'Padarias & Confeitarias',
    slug: 'padaria',
    description: 'Bandejas, embalagens para doces e bolos, filme PVC, sacos de papel e luvas descartáveis.',
    imagePath: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-03-padaria.jpg',
    sortOrder: 3,
  },
  {
    name: 'Festas & Eventos',
    slug: 'loja-de-festas',
    description: 'Copos personalizados, pratos, talheres, forminhas decorativas, guardanapos e velas.',
    imagePath: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-04-festas.jpg',
    sortOrder: 4,
  },
  {
    name: 'Delivery',
    slug: 'delivery',
    description: 'Sacolas kraft, lacres invioláveis, embalagens térmicas, potes antivazamento e caixas para transporte.',
    imagePath: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-09-delivery.jpg',
    sortOrder: 5,
  },
  {
    name: 'Restaurantes & Buffets',
    slug: 'restaurante-buffet',
    description: 'Marmitas térmicas, travessas de alumínio, talheres descartáveis premium e guardanapos folha dupla.',
    imagePath: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-05-buffet.jpg',
    sortOrder: 6,
  },
  {
    name: 'Doces & Confeitaria Caseira',
    slug: 'confeitaria-bolos',
    description: 'Embalagens articuladas para fatias, formas forneáveis, sacos para confeitar e fitas de cetim.',
    imagePath: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-06-confeitaria.jpg',
    sortOrder: 7,
  },
  {
    name: 'Sorveterias & Açaís',
    slug: 'sorveteria-acai',
    description: 'Potes térmicos, copos transparentes com tampa bolha, colheres coloridas e canudos biodegradáveis.',
    imagePath: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-07-acai.jpg',
    sortOrder: 8,
  },
  {
    name: 'Bares & Distribuidoras',
    slug: 'bar-distribuidora',
    description: 'Copos chopp e cerveja descartáveis, petisqueiras, guardanapos de balcão e sacolas reforçadas.',
    imagePath: '/assets/HOME Vitrine/S8-CARDS-Segmentos/s08-segment-08-sustentaveis.jpg',
    sortOrder: 9,
  },
];

type DemoTag = {
  name: string;
  slug: string;
};

const tags: readonly DemoTag[] = [
  { name: 'Biodegradável', slug: 'biodegradavel' },
  { name: 'Térmico', slug: 'termico' },
  { name: 'Kraft', slug: 'kraft' },
  { name: 'Reforçado', slug: 'reforcado' },
  { name: 'Descartável', slug: 'descartavel' },
  { name: 'Transparente', slug: 'transparente' },
  { name: 'Vai ao Micro-ondas', slug: 'vai-ao-micro-ondas' },
];

import { demoProducts, type DemoProduct } from './seed-catalog-data';
export { demoProducts, type DemoProduct };

const uploadsRoot = join(resolveApiStorageRoot(), 'uploads');
const productImgsDir = join(process.cwd(), 'apps', 'storefront', 'public', 'assets', 'PRODUTOS', 'produtos-imgs');
const placeholdersDir = join(process.cwd(), 'apps', 'storefront', 'public', 'assets', 'PRODUTOS', 'placeholders');

/**
 * Resolve uma foto fotográfica real para o produto, buscando fotos específicas de catálogo,
 * palavras-chave relevantes ou placeholders oficiais de estúdio.
 * Nunca gera círculos abstratos ou artes SVG geométricas fictícias.
 */
function resolvePhotoSource(key: string): string {
  // 1. Arquivo direto
  for (const ext of ['.jpg', '.png', '.webp', '.jpeg']) {
    const candidate = join(productImgsDir, `${key}${ext}`);
    if (existsSync(candidate)) return candidate;
  }

  // 2. Correspondência semântica com as fotos reais do catálogo
  const k = key.toLowerCase();
  if (k.includes('coalho')) {
    const p = join(productImgsDir, 'queijo-coalho-espeto-pacote-700g.jpg');
    if (existsSync(p)) return p;
  }
  if (k.includes('queijo')) {
    const p = join(productImgsDir, 'queijo-mussarela-fatiado-1kg.jpg');
    if (existsSync(p)) return p;
  }
  if (k.includes('pizza')) {
    const p = join(productImgsDir, 'caixa-pizza-35cm.jpg');
    if (existsSync(p)) return p;
  }
  if (k.includes('copo') || k.includes('taca')) {
    const p = join(productImgsDir, 'copo-200ml.png');
    if (existsSync(p)) return p;
  }
  if (k.includes('marmita') || k.includes('hamburguer') || k.includes('pote') || k.includes('bandeja')) {
    const p = join(productImgsDir, 'marmita-750ml.jpg');
    if (existsSync(p)) return p;
  }
  if (k.includes('papel') || k.includes('toalha') || k.includes('guardanapo')) {
    const p = join(productImgsDir, 'papel-toalha.jpg');
    if (existsSync(p)) return p;
  }
  if (k.includes('detergente') || k.includes('limpeza') || k.includes('sabao') || k.includes('alcool') || k.includes('sanitaria')) {
    const p = join(productImgsDir, 'detergente-neutro-5l.jpg');
    if (existsSync(p)) return p;
  }
  if (k.includes('sacola') || k.includes('saco') || k.includes('bobina')) {
    const p = join(productImgsDir, 'sacola-38x48.jpg');
    if (existsSync(p)) return p;
  }
  if (k.includes('filme') || k.includes('aluminio') || k.includes('stretch') || k.includes('pvc')) {
    const p = join(productImgsDir, 'filme-pvc-30cm.jpg');
    if (existsSync(p)) return p;
  }
  if (k.includes('vela') || k.includes('balao') || k.includes('festa')) {
    const p = join(productImgsDir, 'velas-aniversario-coloridas.jpg');
    if (existsSync(p)) return p;
  }
  if (k.includes('doce') || k.includes('chocolate') || k.includes('bombom') || k.includes('leite-condensado') || k.includes('cacau')) {
    const p = join(productImgsDir, 'leite-condensado-395g.jpg');
    if (existsSync(p)) return p;
  }
  if (k.includes('forminha') || k.includes('confeitaria')) {
    const p = join(productImgsDir, 'forminha-docinho-n5.jpg');
    if (existsSync(p)) return p;
  }

  // 3. Placeholders fotográficos de estúdio (1 a 4) em alta resolução
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const placeholderIndex = (hash % 4) + 1;
  const placeholderPath = join(placeholdersDir, `placeholder-${placeholderIndex}.png`);
  if (existsSync(placeholderPath)) return placeholderPath;

  return join(placeholdersDir, 'placeholder-1.png');
}

/** Gera as imagens WebP do seed a partir de fotografias reais e devolve o caminho relativo usado no banco. */
async function writeImageSet(key: string, widths: readonly number[], aspect: number, mainWidth: number): Promise<string> {
  const directory = join(uploadsRoot, `seed-${key}`);
  await mkdir(directory, { recursive: true });
  const photoSource = resolvePhotoSource(key);

  for (const width of widths) {
    const height = Math.round(width * aspect);
    const targetFile = join(directory, `${width}.webp`);
    if (existsSync(targetFile) && statSync(targetFile).size > 0) {
      continue;
    }
    await sharp(photoSource)
      .resize({ width, height, fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(targetFile);
  }
  return `uploads/seed-${key}/${mainWidth}.webp`;
}

export async function seedDemoMedia(): Promise<void> {
  for (const product of demoProducts) {
    await writeImageSet(product.slug, [480, 960, 1440], 1, 960);
  }
  for (const banner of ['ofertas', 'cotacao', 'festa']) {
    await writeImageSet(`banner-${banner}`, [960, 1440], 0.42, 1440);
  }
  await writeBrandLogo();
}

/**
 * Converte o logo oficial (referência HTML aprovada, já versionada no repo)
 * para WebP na storage da API. Não há hotlink nem cópia externa.
 */
async function writeBrandLogo(): Promise<void> {
  const source = join(process.cwd(), 'site-comercial-do-norte-html-referencia', 'assets', 'Logos', 'logo-comercial-do-norte.png');
  if (!existsSync(source)) return;
  const directory = join(uploadsRoot, 'seed-brand');
  await mkdir(directory, { recursive: true });
  await sharp(source).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 90 }).toFile(join(directory, 'logo.webp'));
}

export const DEMO_LOGO_PATH = 'uploads/seed-brand/logo.webp';


const demoPostCategories = [
  { name: 'Embalagens & Delivery', slug: 'embalagens-delivery', description: 'Dicas sobre caixas, sacolas e potes térmicos para transporte seguro.' },
  { name: 'Food Service & Bebidas', slug: 'food-service-bebidas', description: 'Soluções em copos, tampas e descartáveis para atendimento ágil.' },
  { name: 'Confeitaria & Festas', slug: 'confeitaria-festas', description: 'Técnicas de decoração, formas e embalagens para doces e bolos.' },
];

const demoPosts = [
  {
    title: 'Embalagens kraft para o seu delivery',
    slug: 'embalagens-kraft-para-o-seu-delivery',
    excerpt: 'Mais praticidade com embalagens kraft. Combine formato e resistência. Valorize a apresentação do seu delivery.',
    content: '<p>As embalagens de papel kraft revolucionaram o delivery de comida e fast-food. Além do apelo ecológico e sustentável que os clientes valorizam, o papel kraft possui excelente resistência mecânica e respirabilidade, mantendo alimentos fritos crocantes por muito mais tempo.</p><h3>Vantagens para o seu negócio:</h3><ul><li><strong>Apresentação premium:</strong> visual artesanal que eleva o valor percebido do seu prato.</li><li><strong>Resistência a gordura:</strong> opções com barreira antigordura para hambúrgueres e batatas.</li><li><strong>Sustentabilidade:</strong> material 100% biodegradável e reciclável.</li></ul><p>Confira a linha completa de sacolas, caixas e barcas kraft disponíveis a pronta entrega na Comercial do Norte.</p>',
    coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/kraft.webp',
    categorySlug: 'embalagens-delivery',
    badges: ['DELIVERY', 'LINHA KRAFT'],
  },
  {
    title: 'Copos e tampas para açaí e café',
    slug: 'copos-e-tampas-para-acai-e-cafe',
    excerpt: 'O copo certo faz a diferença. Combine a tampa com sua bebida. Evite vazamentos no transporte.',
    content: '<p>Escolher a combinação ideal de copo e tampa é fundamental para evitar vazamentos no transporte e garantir a melhor experiência para o seu cliente, seja servindo um café bem quente ou um açaí gelado com complementos.</p><h3>Dicas práticas do Nort:</h3><ul><li><strong>Tampa Bolha para Açaí:</strong> permite adicionar frutas, granola e camadas generosas sem amassar a cobertura.</li><li><strong>Tampa Bico para Café e Bebidas Quentes:</strong> mantém a temperatura por mais tempo e permite consumo durante o trajeto sem respingos.</li><li><strong>Copo Térmico vs Copo Cristal PP:</strong> use copos térmicos para cafés e caldos; para açaí e vitaminas, prefira os copos ultra transparentes para destacar as camadas.</li></ul>',
    coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/copos.webp',
    categorySlug: 'food-service-bebidas',
    badges: ['AÇAÍ & CAFÉ', 'GUIA PRÁTICO'],
  },
  {
    title: 'Caixas de pizza: formatos e respiros que preservam a massa',
    slug: 'caixas-de-pizza-formatos-e-respiros',
    excerpt: 'Tudo sobre caixas oitavadas e quadradas, respiros térmicos e lacres invioláveis para sua pizzaria.',
    content: '<p>A caixa de pizza não é apenas uma embalagem: é a extensão da qualidade da sua cozinha até a casa do cliente. O acúmulo de vapor pode deixar a massa borrachuda e estragar a crocância.</p><h3>O que observar na escolha da caixa:</h3><ul><li><strong>Respiros de ar:</strong> garantem a saída controlada de vapor sem esfriar a pizza.</li><li><strong>Oitavadas vs Quadradas:</strong> as caixas oitavadas evitam que a pizza deslize dentro da caixa durante a moto-entrega.</li><li><strong>Lacre de segurança:</strong> obrigatório e indispensável para transmitir confiança ao cliente final.</li></ul>',
    coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/pizza.webp',
    videoUrl: 'https://www.youtube.com/shorts/m6drhnZQmCM',
    videoDuration: '2:18',
    categorySlug: 'embalagens-delivery',
    badges: ['PIZZARIAS', 'TRANSPORTE SEGURO'],
  },
  {
    title: 'Decoração de doces e bolos com chantilly profissional',
    slug: 'decoracao-de-doces-e-bolos-com-chantilly',
    excerpt: 'Dicas práticas de confeitaria caseira para encantar clientes e aumentar suas vendas de doces.',
    content: '<p>A confeitaria profissional exige domínio de ponto, temperatura e uso correto dos bicos de confeitar. Com as técnicas certas, você valoriza seus bolos de festa e sobremesas para vitrine.</p><h3>Principais recomendações:</h3><ul><li><strong>Ponto Chantininho:</strong> a mistura com leite em pó proporciona mais estabilidade em climas quentes como o Norte do Brasil.</li><li><strong>Bicos 1M e 2D:</strong> os clássicos para rosetas perfeitas e acabamentos elegantes.</li><li><strong>Embalagens altas com trava:</strong> garantem que o topo decorado chegue intacto até a festa do cliente.</li></ul>',
    coverUrl: '/assets/HOME Vitrine/S14-POSTS-ExplicaAi/doces.webp',
    categorySlug: 'confeitaria-festas',
    badges: ['CONFEITARIA', 'DOCES & BOLOS'],
  },
];

const demoEvents = [
  {
    title: 'Encontro de Empreendedores — Uma História de Sucesso',
    slug: 'encontro-de-empreendedores-james-holanda',
    subtitle: 'James Holanda — CEO e Fundador da Comercial do Norte',
    description: 'Venha conhecer a trajetória inspiradora do fundador da Comercial do Norte, compartilhando estratégias de negócios, resiliência, liderança e gestão no mercado de distribuição e embalagens da região Norte.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-01-empreendedores.jpg',
    eventDateText: '31 de Agosto',
    eventTime: '19h30',
    location: 'Igreja Nova Terra',
    locationAddress: 'Belém/PA',
    instructor: 'James Holanda',
    badge: 'PALESTRA',
    ctaLabel: 'Garantir Vaga',
    ctaUrl: 'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+participar+do+Encontro+de+Empreendedores+com+James+Holanda',
    sortOrder: 1,
  },
  {
    title: 'Grande Reinauguração Loja Pedreira',
    slug: 'grande-reinauguracao-loja-pedreira',
    subtitle: 'Onde tem Comercial do Norte você vende muito mais',
    description: 'Reinauguração oficial da nossa mega loja no bairro da Pedreira! Novo layout moderno, espaço ampliado, promoções exclusivas de reinauguração e café da manhã especial para clientes e parceiros.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-02-reinauguracao.jpg',
    eventDateText: '03 de Julho',
    eventTime: '08h',
    location: 'Loja Pedreira',
    locationAddress: 'Travessa Mauriti, entre Pedro Miranda e Antônio Everdosa — Pedreira, Belém/PA',
    badge: 'REINAUGURAÇÃO',
    ctaLabel: 'Ver Como Chegar',
    ctaUrl: 'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+mais+informa%C3%A7%C3%B5es+sobre+a+reinaugura%C3%A7%C3%A3o+da+Loja+Pedreira',
    sortOrder: 2,
  },
  {
    title: 'Workshop de Confeitaria Profissional: Decoração com Chantilly e Bicos',
    slug: 'workshop-confeitaria-profissional-chantilly-bicos',
    subtitle: 'Aprenda técnicas exclusivas com um especialista em confeitaria',
    description: 'Treinamento prático voltado para boleiras, confeiteiras e pequenos produtores. Conteúdo aborda: ponto correto do chantilly, técnicas de bicos russos e perlê, trabalho com chantininho, nivelamento de bolos e decorações modernas.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-03-workshop-confeitaria.jpg',
    eventDateText: 'Em breve',
    eventTime: '14h às 18h',
    location: 'Centro Técnico Comercial do Norte',
    locationAddress: 'Belém/PA',
    instructor: 'Mestre Doceiro',
    badge: 'WORKSHOP',
    ctaLabel: 'Inscreva-se Já!',
    ctaUrl: 'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+me+inscrever+no+Workshop+de+Confeitaria+com+Chantilly+e+Bicos',
    sortOrder: 3,
  },
  {
    title: 'Croquete de Charque com Maionese de Chicória — Pará Trigo 2026',
    slug: 'sabado-croquete-de-charque-para-trigo',
    subtitle: 'Aula-show gastronômica regional no Stand Comercial do Norte',
    description: 'Aprenda o passo a passo completo da receita consagrada de croquete de charque com toque regional de maionese de chicória. Aula prática demonstrativa ministrada pela instrutora Thais Reis, com degustação ao final.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-04-croquete.jpg',
    eventDateText: '03/10 (Sábado)',
    eventTime: '17h',
    location: 'Hangar Centro de Convenções',
    locationAddress: 'Stand Comercial do Norte — Feira Pará Trigo, Belém/PA',
    instructor: 'Thais Reis',
    badge: 'AULA-SHOW',
    ctaLabel: 'Confirmar Presença',
    ctaUrl: 'https://wa.me/5591983440880?text=Ol%C3%A1!+Gostaria+de+confirmar+presen%C3%A7a+na+aula-show+Croquete+de+Charque+no+Hangar',
    sortOrder: 4,
  },
  {
    title: 'Doces Finos e Brigadeiros Gourmet para Casamentos e Festas',
    slug: 'workshop-doces-finos-brigadeiros-gourmet',
    subtitle: 'Técnicas de ponto perfeito, texturas aveludadas e embalagens de luxo',
    description: 'Workshop mão na massa com receitas consagradas de brigadeiros gourmet, trufas finas, banho de chocolate nobre e apresentação em forminhas especiais e caixas rígidas para festas sofisticadas.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-03-workshop-confeitaria.jpg',
    eventDateText: '18 de Novembro',
    eventTime: '13h30 às 17h30',
    location: 'Centro Técnico Comercial do Norte',
    locationAddress: 'Av. Bernardo Sayão — Belém/PA',
    instructor: 'Chef Confeiteira Convidada',
    badge: 'WORKSHOP CONFEITARIA',
    ctaLabel: 'Garantir Vaga',
    ctaUrl: 'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+me+inscrever+no+Workshop+Doces+Finos+e+Brigadeiros+Gourmet',
    sortOrder: 5,
  },
  {
    title: 'Sobremesas na Taça & Copos da Felicidade: Sucesso de Vendas',
    slug: 'workshop-sobremesas-na-taca-copo-da-felicidade',
    subtitle: 'Montagem estratégica, cremes estruturados e apresentação irresistível',
    description: 'Domine a preparação de sobremesas geladas de alto giro e excelente margem de lucro. Aprenda cremes básicos estruturados (ninho, 4 leites, ganaches nobres), montagens em camadas nos copos bolha e taças acrílicas, com dicas de conservação e precificação comercial.',
    posterUrl: '/assets/HOME Vitrine/S12-EVENTOS/s12-event-03-workshop-confeitaria.jpg',
    eventDateText: '25 de Novembro',
    eventTime: '14h às 18h',
    location: 'Auditório Gastronômico Comercial do Norte',
    locationAddress: 'Travessa Mauriti — Belém/PA',
    instructor: 'Especialista em Sobremesas',
    badge: 'AULAS CONFEITARIA',
    ctaLabel: 'Garantir Vaga',
    ctaUrl: 'https://wa.me/5591983440880?text=Ol%C3%A1!+Quero+me+inscrever+no+Workshop+Sobremesas+na+Ta%C3%A7a',
    sortOrder: 6,
  },
];

async function seedCmsContent(prisma: PrismaClient): Promise<void> {
  const postCatIdBySlug = new Map<string, string>();
  for (const cat of demoPostCategories) {
    const row = await prisma.postCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, status: 'ACTIVE' },
      create: { name: cat.name, slug: cat.slug, description: cat.description, status: 'ACTIVE', legacySource: DEMO_SOURCE, legacyId: cat.slug },
    });
    postCatIdBySlug.set(cat.slug, row.id);
  }

  for (const post of demoPosts) {
    const categoryId = postCatIdBySlug.get(post.categorySlug);
    const postWithVideo = post as typeof post & { videoUrl?: string; videoDuration?: string };
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverUrl: post.coverUrl,
        videoUrl: postWithVideo.videoUrl || null,
        videoDuration: postWithVideo.videoDuration || null,
        badges: post.badges,
        categoryId: categoryId || null,
        status: 'ACTIVE',
      },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverUrl: post.coverUrl,
        videoUrl: postWithVideo.videoUrl || null,
        videoDuration: postWithVideo.videoDuration || null,
        badges: post.badges,
        categoryId: categoryId || null,
        status: 'ACTIVE',
        legacySource: DEMO_SOURCE,
        legacyId: post.slug,
      },
    });
  }

  for (const event of demoEvents) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {
        title: event.title,
        subtitle: event.subtitle,
        description: event.description,
        posterUrl: event.posterUrl,
        eventDateText: event.eventDateText,
        eventTime: event.eventTime,
        location: event.location,
        locationAddress: event.locationAddress,
        instructor: event.instructor,
        badge: event.badge,
        ctaLabel: event.ctaLabel,
        ctaUrl: event.ctaUrl,
        sortOrder: event.sortOrder,
        status: 'ACTIVE',
      },
      create: {
        title: event.title,
        slug: event.slug,
        subtitle: event.subtitle,
        description: event.description,
        posterUrl: event.posterUrl,
        eventDateText: event.eventDateText,
        eventTime: event.eventTime,
        location: event.location,
        locationAddress: event.locationAddress,
        instructor: event.instructor,
        badge: event.badge,
        ctaLabel: event.ctaLabel,
        ctaUrl: event.ctaUrl,
        sortOrder: event.sortOrder,
        status: 'ACTIVE',
        legacySource: DEMO_SOURCE,
        legacyId: event.slug,
      },
    });
  }
}

export async function seedCatalog(prisma: PrismaClient): Promise<{ categories: number; products: number }> {
  await seedDemoMedia();

  // Limpeza de marcas e produtos de demonstração legados que não fazem mais parte do seed atual
  const currentBrandSlugs = new Set(brands.map((b) => b.slug));
  const staleBrands = await prisma.brand.findMany({
    where: { legacySource: DEMO_SOURCE, slug: { notIn: Array.from(currentBrandSlugs) } },
    select: { id: true },
  });
  if (staleBrands.length > 0) {
    const staleIds = staleBrands.map((b) => b.id);
    await prisma.product.updateMany({
      where: { brandId: { in: staleIds } },
      data: { brandId: null },
    });
    await prisma.brand.deleteMany({
      where: { id: { in: staleIds } },
    });
  }

  const currentProductSlugs = new Set(demoProducts.map((p) => p.slug));
  const staleProducts = await prisma.product.findMany({
    where: { legacySource: DEMO_SOURCE, slug: { notIn: Array.from(currentProductSlugs) } },
    select: { id: true },
  });
  if (staleProducts.length > 0) {
    const staleIds = staleProducts.map((p) => p.id);
    await prisma.productCategory.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.productSegment.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.productTag.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.productImage.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.customerFavorite.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.promotionScope.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.couponProductRule.deleteMany({ where: { productId: { in: staleIds } } });
    const variants = await prisma.productVariant.findMany({
      where: { productId: { in: staleIds } },
      select: { id: true },
    });
    if (variants.length > 0) {
      const vIds = variants.map((v) => v.id);
      await prisma.stockMovement.deleteMany({ where: { variantId: { in: vIds } } });
      await prisma.inventoryReservation.deleteMany({ where: { variantId: { in: vIds } } });
      await prisma.cartItem.deleteMany({ where: { variantId: { in: vIds } } });
      await prisma.inventoryBalance.deleteMany({ where: { variantId: { in: vIds } } });
      await prisma.productVariant.deleteMany({ where: { id: { in: vIds } } });
    }
    await prisma.product.deleteMany({ where: { id: { in: staleIds } } });
  }

  const categoryIdBySlug = new Map<string, string>();
  // Duas passadas: categorias principais primeiro, depois as subcategorias com parentId.
  for (const category of categories.filter((item) => !item.parentSlug)) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, status: 'ACTIVE', sortOrder: 0 },
      create: { name: category.name, slug: category.slug, status: 'ACTIVE', sortOrder: 0, legacySource: DEMO_SOURCE, legacyId: category.slug },
    });
    categoryIdBySlug.set(category.slug, row.id);
  }
  for (const category of categories.filter((item) => item.parentSlug)) {
    const parentId = categoryIdBySlug.get(category.parentSlug ?? '');
    if (!parentId) continue;
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, status: 'ACTIVE', parentId },
      create: { name: category.name, slug: category.slug, status: 'ACTIVE', parentId, legacySource: DEMO_SOURCE, legacyId: category.slug },
    });
    categoryIdBySlug.set(category.slug, row.id);
  }

  const brandIdBySlug = new Map<string, string>();
  for (const brand of brands.filter((item) => !item.parentSlug)) {
    const row = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        imagePath: brand.imagePath ?? null,
        description: brand.description ?? null,
        status: 'ACTIVE',
      },
      create: {
        name: brand.name,
        slug: brand.slug,
        imagePath: brand.imagePath ?? null,
        description: brand.description ?? null,
        status: 'ACTIVE',
        legacySource: DEMO_SOURCE,
        legacyId: brand.slug,
      },
    });
    brandIdBySlug.set(brand.slug, row.id);
  }
  for (const brand of brands.filter((item) => item.parentSlug)) {
    const parentId = brandIdBySlug.get(brand.parentSlug ?? '');
    if (!parentId) continue;
    const row = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        parentId,
        status: 'ACTIVE',
      },
      create: {
        name: brand.name,
        slug: brand.slug,
        parentId,
        status: 'ACTIVE',
        legacySource: DEMO_SOURCE,
        legacyId: brand.slug,
      },
    });
    brandIdBySlug.set(brand.slug, row.id);
  }

  const segmentIdBySlug = new Map<string, string>();
  for (const segment of segments) {
    const row = await prisma.segment.upsert({
      where: { slug: segment.slug },
      update: {
        name: segment.name,
        description: segment.description,
        imagePath: segment.imagePath,
        sortOrder: segment.sortOrder,
        status: 'ACTIVE',
      },
      create: {
        name: segment.name,
        slug: segment.slug,
        description: segment.description,
        imagePath: segment.imagePath,
        sortOrder: segment.sortOrder,
        status: 'ACTIVE',
        legacySource: DEMO_SOURCE,
        legacyId: segment.slug,
      },
    });
    segmentIdBySlug.set(segment.slug, row.id);
  }

  const tagIdBySlug = new Map<string, string>();
  for (const tag of tags) {
    const row = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, status: 'ACTIVE' },
      create: {
        name: tag.name,
        slug: tag.slug,
        status: 'ACTIVE',
        legacySource: DEMO_SOURCE,
        legacyId: tag.slug,
      },
    });
    tagIdBySlug.set(tag.slug, row.id);
  }

  const subbrandSlugs = brands.filter((b) => b.parentSlug).map((b) => b.slug);

  for (let idx = 0; idx < demoProducts.length; idx++) {
    const product = demoProducts[idx];
    const imagePath = `uploads/seed-${product.slug}/960.webp`;
    const assignedBrandSlug = product.brandSlug || 'fasapel';
    const assignedBrandId = brandIdBySlug.get(assignedBrandSlug) ?? brandIdBySlug.get('fasapel');

    const productRow = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        status: product.status,
        brandId: assignedBrandId,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        status: product.status,
        brandId: assignedBrandId,
        legacySource: DEMO_SOURCE,
        legacyId: product.slug,
      },
    });

    const catSlugs = product.categorySlugs && product.categorySlugs.length > 0
      ? product.categorySlugs
      : product.categorySlug ? [product.categorySlug] : [];

    if (catSlugs.length > 0) {
      await prisma.productCategory.deleteMany({ where: { productId: productRow.id } });
      for (const cSlug of catSlugs) {
        const categoryId = categoryIdBySlug.get(cSlug);
        if (categoryId) {
          await prisma.productCategory.create({ data: { productId: productRow.id, categoryId } });
        }
      }
    }

    const variant = await prisma.productVariant.upsert({
      where: { sku: product.sku },
      update: {
        productId: productRow.id,
        priceCents: product.priceCents,
        compareAtPriceCents: product.compareAtPriceCents ?? null,
        weightGrams: product.weightGrams,
        widthMm: product.widthMm ?? null,
        heightMm: product.heightMm ?? null,
        lengthMm: product.lengthMm ?? null,
        status: 'ACTIVE',
        stockStatus: 'IN_STOCK',
      },
      create: {
        productId: productRow.id,
        sku: product.sku,
        priceCents: product.priceCents,
        compareAtPriceCents: product.compareAtPriceCents,
        weightGrams: product.weightGrams,
        widthMm: product.widthMm,
        heightMm: product.heightMm,
        lengthMm: product.lengthMm,
        status: 'ACTIVE',
        stockStatus: 'IN_STOCK',
        inventoryBalance: { create: { physicalQuantity: product.physicalQuantity } },
      },
    });

    await prisma.inventoryBalance.upsert({
      where: { variantId: variant.id },
      update: { physicalQuantity: product.physicalQuantity },
      create: { variantId: variant.id, physicalQuantity: product.physicalQuantity },
    });

    await prisma.productImage.deleteMany({ where: { productId: productRow.id } });
    await prisma.productImage.create({
      data: {
        productId: productRow.id,
        variantId: variant.id,
        path: imagePath,
        altText: product.name,
        isPrimary: true,
        sortOrder: 0,
      },
    });

    if (product.segmentSlugs && product.segmentSlugs.length > 0) {
      await prisma.productSegment.deleteMany({ where: { productId: productRow.id } });
      for (const segSlug of product.segmentSlugs) {
        const segId = segmentIdBySlug.get(segSlug);
        if (segId) {
          await prisma.productSegment.create({
            data: { productId: productRow.id, segmentId: segId },
          });
        }
      }
    }

    if (product.tagSlugs && product.tagSlugs.length > 0) {
      await prisma.productTag.deleteMany({ where: { productId: productRow.id } });
      for (const tSlug of product.tagSlugs) {
        const tId = tagIdBySlug.get(tSlug);
        if (tId) {
          await prisma.productTag.create({
            data: { productId: productRow.id, tagId: tId },
          });
        }
      }
    }
  }

  await seedCmsContent(prisma);

  return { categories: categories.length, products: demoProducts.length };
}
