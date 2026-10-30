import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
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

const brands = [{ name: 'Marca Exemplo', slug: 'marca-exemplo' }] as const;

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

type DemoProduct = {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  segmentSlugs?: string[];
  tagSlugs?: string[];
  sku: string;
  priceCents: number;
  compareAtPriceCents?: number;
  weightGrams: number;
  widthMm?: number;
  heightMm?: number;
  lengthMm?: number;
  physicalQuantity: number;
  status: 'ACTIVE' | 'DRAFT';
};

/** Produtos de exemplo. Dois ficam em DRAFT para exercitar a fila de publicação. */
export const demoProducts: readonly DemoProduct[] = [
  {
    slug: 'copo-descartavel-300ml', name: 'Copo Descartável Transparente 300 ml',
    description: 'Pacote com 100 unidades. Produto de demonstração do catálogo.',
    categorySlug: 'copos', segmentSlugs: ['lanchonete', 'bar-distribuidora', 'loja-de-festas', 'delivery'], tagSlugs: ['descartavel', 'transparente'], sku: 'DEMO-COP-300', priceCents: 890, compareAtPriceCents: 1090,
    weightGrams: 1200, widthMm: 300, heightMm: 400, lengthMm: 300, physicalQuantity: 180, status: 'ACTIVE',
  },
  {
    slug: 'prato-descartavel-21cm', name: 'Prato Descartável Branco 21 cm',
    description: 'Pacote com 50 unidades. Produto de demonstração do catálogo.',
    categorySlug: 'pratos', segmentSlugs: ['loja-de-festas', 'restaurante-buffet'], tagSlugs: ['descartavel'], sku: 'DEMO-PRA-021', priceCents: 1250,
    weightGrams: 900, widthMm: 210, heightMm: 120, lengthMm: 210, physicalQuantity: 140, status: 'ACTIVE',
  },
  {
    slug: 'guardanapo-papel-24x24', name: 'Guardanapo de Papel 24 x 24 cm',
    description: 'Pacote com 50 unidades. Produto de demonstração do catálogo.',
    categorySlug: 'artigos-para-festa', segmentSlugs: ['lanchonete', 'pizzaria', 'restaurante-buffet', 'delivery'], tagSlugs: ['biodegradavel'], sku: 'DEMO-GUA-2424', priceCents: 650,
    weightGrams: 500, widthMm: 240, heightMm: 80, lengthMm: 240, physicalQuantity: 220, status: 'ACTIVE',
  },
  {
    slug: 'caixa-pizza-35cm', name: 'Caixa de Pizza 35 cm',
    description: 'Caixa de papelão para pizza, 100 unidades. Produto de demonstração do catálogo.',
    categorySlug: 'caixas-e-bandejas', segmentSlugs: ['pizzaria', 'delivery'], tagSlugs: ['kraft', 'termico'], sku: 'DEMO-CAI-035', priceCents: 390, compareAtPriceCents: 450,
    weightGrams: 400, widthMm: 350, heightMm: 40, lengthMm: 350, physicalQuantity: 300, status: 'ACTIVE',
  },
  {
    slug: 'bandeja-isopor-n2', name: 'Bandeja de Isopor nº 2',
    description: 'Bandeja para frios e carnes, 100 unidades. Produto de demonstração do catálogo.',
    categorySlug: 'caixas-e-bandejas', segmentSlugs: ['padaria', 'restaurante-buffet', 'delivery'], tagSlugs: ['termico', 'descartavel'], sku: 'DEMO-BAN-002', priceCents: 990, compareAtPriceCents: 1290,
    weightGrams: 300, widthMm: 250, heightMm: 30, lengthMm: 200, physicalQuantity: 160, status: 'ACTIVE',
  },
  {
    slug: 'sacola-plastica-40x50', name: 'Sacola Plástica Reforçada 40 x 50 cm',
    description: 'Fardo com 1 kg de sacolas. Produto de demonstração do catálogo.',
    categorySlug: 'sacos-e-sacolas', segmentSlugs: ['lanchonete', 'pizzaria', 'padaria', 'bar-distribuidora', 'delivery'], tagSlugs: ['reforcado'], sku: 'DEMO-SAC-4050', priceCents: 1590, compareAtPriceCents: 2035,
    weightGrams: 1500, widthMm: 400, heightMm: 60, lengthMm: 500, physicalQuantity: 90, status: 'ACTIVE',
  },
  {
    slug: 'sacola-kraft-delivery', name: 'Sacola de Papel Kraft Delivery com Alça',
    description: 'Pacote com 50 unidades. Sacola de papel kraft resistente ideal para entregas de pedidos e delivery.',
    categorySlug: 'sacos-e-sacolas', segmentSlugs: ['delivery', 'lanchonete', 'restaurante-buffet'], tagSlugs: ['kraft', 'biodegradavel', 'reforcado'], sku: 'DEMO-SAC-KRAFT-DEL', priceCents: 1890, compareAtPriceCents: 2250,
    weightGrams: 1400, widthMm: 320, heightMm: 390, lengthMm: 180, physicalQuantity: 150, status: 'ACTIVE',
  },
  {
    slug: 'lacre-seguranca-delivery', name: 'Lacre de Segurança Inviolável para Delivery',
    description: 'Rolo com 500 etiquetas adesivas invioláveis. Garante a proteção e integridade dos pedidos até a entrega.',
    categorySlug: 'caixas-e-bandejas', segmentSlugs: ['delivery', 'pizzaria', 'lanchonete'], tagSlugs: ['reforcado', 'kraft'], sku: 'DEMO-LAC-SEG-500', priceCents: 1490, compareAtPriceCents: 1790,
    weightGrams: 280, widthMm: 100, heightMm: 100, lengthMm: 45, physicalQuantity: 240, status: 'ACTIVE',
  },
  {
    slug: 'pote-termico-molho-250ml', name: 'Pote Térmico com Tampa Antivazamento 250 ml',
    description: 'Pacote com 50 unidades. Embalagem térmica hermética para sopas, caldos e molhos no delivery.',
    categorySlug: 'caixas-e-bandejas', segmentSlugs: ['delivery', 'restaurante-buffet', 'lanchonete'], tagSlugs: ['termico', 'descartavel'], sku: 'DEMO-POT-TER-250', priceCents: 1290, compareAtPriceCents: 1550,
    weightGrams: 450, widthMm: 120, heightMm: 80, lengthMm: 120, physicalQuantity: 180, status: 'ACTIVE',
  },
  {
    slug: 'velas-aniversario-coloridas', name: 'Velas de Aniversário Coloridas',
    description: 'Cartela com 12 velas. Produto de demonstração do catálogo.',
    categorySlug: 'velas-e-suprimentos', segmentSlugs: ['loja-de-festas', 'confeitaria-bolos'], sku: 'DEMO-VEL-0012', priceCents: 420,
    weightGrams: 120, widthMm: 150, heightMm: 20, lengthMm: 100, physicalQuantity: 75, status: 'ACTIVE',
  },
  {
    slug: 'forminha-docinho-n5', name: 'Forminha de Docinho nº 5',
    description: 'Pacote com 100 forminhas. Produto de demonstração do catálogo.',
    categorySlug: 'doces-e-bomboniere', segmentSlugs: ['confeitaria-bolos', 'loja-de-festas'], tagSlugs: ['descartavel'], sku: 'DEMO-FOR-005', priceCents: 730,
    weightGrams: 200, widthMm: 200, heightMm: 60, lengthMm: 150, physicalQuantity: 210, status: 'ACTIVE',
  },
  {
    slug: 'detergente-neutro-5l', name: 'Detergente Neutro 5 L',
    description: 'Galão de 5 litros. Produto de demonstração do catálogo.',
    categorySlug: 'produtos-de-limpeza', segmentSlugs: ['restaurante-buffet', 'padaria', 'lanchonete'], tagSlugs: ['reforcado'], sku: 'DEMO-DET-005L', priceCents: 2490, compareAtPriceCents: 2790,
    weightGrams: 5200, widthMm: 200, heightMm: 300, lengthMm: 150, physicalQuantity: 60, status: 'ACTIVE',
  },
  {
    slug: 'leite-condensado-395g', name: 'Leite Condensado 395 g',
    description: 'Lata de 395 g. Produto de demonstração do catálogo.',
    categorySlug: 'mercearia', segmentSlugs: ['confeitaria-bolos', 'padaria'], sku: 'DEMO-LEI-395', priceCents: 749,
    weightGrams: 400, widthMm: 80, heightMm: 110, lengthMm: 80, physicalQuantity: 320, status: 'ACTIVE',
  },
  {
    // DRAFT: falta comprimento, então a publicação deve falhar com PRODUCT_INCOMPLETE.
    slug: 'filme-pvc-30cm', name: 'Filme PVC 30 cm x 30 m',
    description: 'Rolo de filme PVC. Produto de demonstração aguardando dados completos.',
    categorySlug: 'filme-e-aluminio', segmentSlugs: ['padaria', 'restaurante-buffet'], tagSlugs: ['transparente'], sku: 'DEMO-FIL-030', priceCents: 1890,
    weightGrams: 350, widthMm: 300, heightMm: 100, physicalQuantity: 45, status: 'DRAFT',
  },
  {
    // DRAFT completo: publicar deve funcionar assim que o marketing decidir.
    slug: 'queijo-mussarela-fatiado-1kg', name: 'Queijo Mussarela Fatiado 1 kg',
    description: 'Pacote de 1 kg. Produto de demonstração pronto para publicação.',
    categorySlug: 'frios-e-laticinios', segmentSlugs: ['pizzaria', 'lanchonete', 'padaria'], tagSlugs: ['reforcado'], sku: 'DEMO-QUE-001', priceCents: 3990,
    weightGrams: 1000, widthMm: 250, heightMm: 60, lengthMm: 200, physicalQuantity: 25, status: 'DRAFT',
  },
] as const;

const uploadsRoot = join(resolveApiStorageRoot(), 'uploads');

function buildSvg(width: number, height: number, seed: string): string {
  const hash = createHash('sha1').update(seed).digest();
  const hue = Math.round((hash[0] / 255) * 360);
  const accent = `hsl(${(hue + 160) % 360}, 72%, 60%)`;
  const base = `hsl(${hue}, 58%, 30%)`;
  const deep = `hsl(${(hue + 30) % 360}, 62%, 18%)`;
  const shapes = Array.from({ length: 5 }, (_, index) => {
    const cx = ((hash[(index * 3) % 20] / 255) * width).toFixed(0);
    const cy = ((hash[(index * 3 + 1) % 20] / 255) * height).toFixed(0);
    const radius = (((hash[(index * 3 + 2) % 20] / 255) * 0.32 + 0.06) * Math.min(width, height)).toFixed(0);
    const opacity = (0.14 + (hash[(index * 3 + 3) % 20] / 255) * 0.22).toFixed(2);
    return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${accent}" opacity="${opacity}"/>`;
  }).join('');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${base}"/><stop offset="100%" stop-color="${deep}"/></linearGradient></defs>`,
    `<rect width="${width}" height="${height}" fill="url(#bg)"/>`,
    shapes,
    `<rect x="${(width * 0.08).toFixed(0)}" y="${(height * 0.8).toFixed(0)}" width="${(width * 0.32).toFixed(0)}" height="${(height * 0.055).toFixed(0)}" rx="${(height * 0.0275).toFixed(0)}" fill="#E33C34" opacity="0.92"/>`,
    '</svg>',
  ].join('');
}

/** Gera as imagens WebP do seed e devolve o caminho relativo usado no banco. */
async function writeImageSet(key: string, widths: readonly number[], aspect: number, mainWidth: number): Promise<string> {
  const directory = join(uploadsRoot, `seed-${key}`);
  await mkdir(directory, { recursive: true });
  for (const width of widths) {
    const height = Math.round(width * aspect);
    await sharp(Buffer.from(buildSvg(width, height, key)))
      .webp({ quality: 82 })
      .toFile(join(directory, `${width}.webp`));
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
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverUrl: post.coverUrl,
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
  for (const brand of brands) {
    const row = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, status: 'ACTIVE' },
      create: { name: brand.name, slug: brand.slug, status: 'ACTIVE', legacySource: DEMO_SOURCE, legacyId: brand.slug },
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

  for (const product of demoProducts) {
    const imagePath = `uploads/seed-${product.slug}/960.webp`;
    const productRow = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        status: product.status,
        brandId: brandIdBySlug.get('marca-exemplo'),
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        status: product.status,
        brandId: brandIdBySlug.get('marca-exemplo'),
        legacySource: DEMO_SOURCE,
        legacyId: product.slug,
      },
    });

    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (categoryId) {
      await prisma.productCategory.deleteMany({ where: { productId: productRow.id } });
      await prisma.productCategory.create({ data: { productId: productRow.id, categoryId } });
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
