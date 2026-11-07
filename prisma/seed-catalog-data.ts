export type DemoProduct = {
  slug: string;
  name: string;
  description: string;
  categorySlug?: string;
  categorySlugs?: readonly string[];
  segmentSlugs?: readonly string[];
  tagSlugs?: readonly string[];
  brandSlug?: string;
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

export const demoProducts: readonly DemoProduct[] = [
  {
  "slug": "fasapel-papel-toalha-interfolhado-2-dobras-luxo",
  "name": "Papel Toalha Interfolhado 2 Dobras 100% Celulose Fasapel",
  "description": "Fardo com 1.000 folhas duplas 100% celulose virgem de altíssima absorção e maciez. Não esfarela ao secar as mãos.",
  "categorySlugs": [
    "descartaveis",
    "produtos-de-limpeza"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "lanchonete",
    "padaria",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "reforcado",
    "descartavel",
    "biodegradavel"
  ],
  "brandSlug": "fasapel-guardanapos-toalhas",
  "sku": "FAS-TOA-2D-1000",
  "priceCents": 2490,
  "compareAtPriceCents": 2990,
  "weightGrams": 1800,
  "widthMm": 210,
  "heightMm": 220,
  "lengthMm": 300,
  "physicalQuantity": 350,
  "status": "ACTIVE"
},
  {
  "slug": "fasapel-toalha-bobina-autocorte-200m",
  "name": "Papel Toalha Bobina Auto Corte 200 m Fasapel",
  "description": "Rolo industrial de 200 metros para dispensador autocorte. Gramatura uniforme com máxima retenção de umidade.",
  "categorySlugs": [
    "descartaveis",
    "produtos-de-limpeza"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "lanchonete",
    "padaria"
  ],
  "tagSlugs": [
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "fasapel-guardanapos-toalhas",
  "sku": "FAS-BOB-200M",
  "priceCents": 1990,
  "compareAtPriceCents": 2350,
  "weightGrams": 1200,
  "widthMm": 200,
  "heightMm": 200,
  "lengthMm": 200,
  "physicalQuantity": 280,
  "status": "ACTIVE"
},
  {
  "slug": "fasapel-guardanapo-folha-dupla-33x33",
  "name": "Guardanapo de Papel Folha Dupla 33x33 cm Fasapel",
  "description": "Pacote com 50 unidades folha dupla em relevo especial. Toque suave e absorção premium para mesas de restaurantes e eventos.",
  "categorySlugs": [
    "descartaveis",
    "artigos-para-festa"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "loja-de-festas",
    "delivery",
    "pizzaria"
  ],
  "tagSlugs": [
    "descartavel",
    "biodegradavel"
  ],
  "brandSlug": "fasapel-guardanapos-toalhas",
  "sku": "FAS-GUA-FD-33",
  "priceCents": 750,
  "compareAtPriceCents": 920,
  "weightGrams": 280,
  "widthMm": 165,
  "heightMm": 165,
  "lengthMm": 50,
  "physicalQuantity": 420,
  "status": "ACTIVE"
},
  {
  "slug": "fasapel-guardanapo-cocktail-24x24-festa",
  "name": "Guardanapo Cocktail Especial 24x24 cm Fasapel",
  "description": "Pacote com 100 guardanapos compactos especiais para drinks, finger foods e mesas de buffet requintadas.",
  "categorySlugs": [
    "artigos-para-festa",
    "descartaveis"
  ],
  "segmentSlugs": [
    "bar-distribuidora",
    "loja-de-festas",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "descartavel"
  ],
  "brandSlug": "fasapel-guardanapos-toalhas",
  "sku": "FAS-GUA-COCK-24",
  "priceCents": 620,
  "compareAtPriceCents": 780,
  "weightGrams": 210,
  "widthMm": 120,
  "heightMm": 120,
  "lengthMm": 60,
  "physicalQuantity": 310,
  "status": "ACTIVE"
},
  {
  "slug": "fasapel-guardanapo-tv-lanchonete-14x14",
  "name": "Guardanapo Sachê TV para Suporte 14x14 cm Fasapel",
  "description": "Fardo com 2.000 folhas tipo sachê sanfonado para porta-guardanapos de mesa e balcão em lanchonetes e bares.",
  "categorySlugs": [
    "descartaveis"
  ],
  "segmentSlugs": [
    "lanchonete",
    "pizzaria",
    "bar-distribuidora",
    "delivery"
  ],
  "tagSlugs": [
    "descartavel"
  ],
  "brandSlug": "fasapel-guardanapos-toalhas",
  "sku": "FAS-GUA-TV-14",
  "priceCents": 1650,
  "compareAtPriceCents": 1980,
  "weightGrams": 950,
  "widthMm": 140,
  "heightMm": 140,
  "lengthMm": 250,
  "physicalQuantity": 500,
  "status": "ACTIVE"
},
  {
  "slug": "fasapel-papel-higienico-rolao-folha-dupla-300m",
  "name": "Papel Higiênico Institucional Rolão Folha Dupla 300 m Fasapel",
  "description": "Fardo com 8 rolos de 300 metros cada, folha dupla 100% celulose. Reduz a frequência de trocas em sanitários de alto fluxo.",
  "categorySlugs": [
    "produtos-de-limpeza"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "lanchonete",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "descartavel",
    "reforcado"
  ],
  "brandSlug": "fasapel-papel-institucional",
  "sku": "FAS-ROL-FD-300",
  "priceCents": 5890,
  "compareAtPriceCents": 6800,
  "weightGrams": 4800,
  "widthMm": 450,
  "heightMm": 450,
  "lengthMm": 230,
  "physicalQuantity": 180,
  "status": "ACTIVE"
},
  {
  "slug": "fasapel-papel-higienico-rolao-folha-simples-500m",
  "name": "Papel Higiênico Rolão Jumbo 500 m Fasapel",
  "description": "Fardo com 8 rolos industriais jumbo de 500 metros. Máxima economia e rendimento operacional para empresas e comércios.",
  "categorySlugs": [
    "produtos-de-limpeza"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "lanchonete",
    "padaria"
  ],
  "tagSlugs": [
    "descartavel"
  ],
  "brandSlug": "fasapel-papel-institucional",
  "sku": "FAS-ROL-FS-500",
  "priceCents": 4990,
  "compareAtPriceCents": 5690,
  "weightGrams": 5200,
  "widthMm": 480,
  "heightMm": 480,
  "lengthMm": 240,
  "physicalQuantity": 210,
  "status": "ACTIVE"
},
  {
  "slug": "fasapel-lencol-hospitalar-papel-70x50",
  "name": "Lençol de Papel Hospitalar Descartável 70 cm x 50 m Fasapel",
  "description": "Rolo de lençol descartável em celulose virgem com picote a cada 50 cm. Higiene garantida para macas e consultórios.",
  "categorySlugs": [
    "produtos-de-limpeza",
    "descartaveis"
  ],
  "segmentSlugs": [
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "descartavel"
  ],
  "brandSlug": "fasapel-papel-institucional",
  "sku": "FAS-LEN-7050",
  "priceCents": 2290,
  "weightGrams": 1100,
  "widthMm": 120,
  "heightMm": 700,
  "lengthMm": 120,
  "physicalQuantity": 140,
  "status": "ACTIVE"
},
  {
  "slug": "fasapel-protetor-assento-sanitario-refil",
  "name": "Refil de Protetor de Assento Sanitário Descartável Fasapel",
  "description": "Caixa com 60 unidades descartáveis em papel biodegradável solúvel em água. Proteção e assepsia para clientes.",
  "categorySlugs": [
    "produtos-de-limpeza"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "lanchonete",
    "padaria"
  ],
  "tagSlugs": [
    "descartavel",
    "biodegradavel"
  ],
  "brandSlug": "fasapel-papel-institucional",
  "sku": "FAS-PROT-SAN-60",
  "priceCents": 1490,
  "weightGrams": 350,
  "widthMm": 280,
  "heightMm": 380,
  "lengthMm": 30,
  "physicalQuantity": 260,
  "status": "ACTIVE"
},
  {
  "slug": "fasapel-pano-multiuso-wypall-tipo-bobina",
  "name": "Rolo de Pano Multiuso com Picote 300 Folhas Fasapel",
  "description": "Bobina com 300 panos semi-descartáveis não tecidos antibacterianos para limpeza pesada em cozinhas profissionais.",
  "categorySlugs": [
    "produtos-de-limpeza"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "lanchonete",
    "pizzaria",
    "padaria"
  ],
  "tagSlugs": [
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "fasapel-guardanapos-toalhas",
  "sku": "FAS-PANO-ROLL",
  "priceCents": 3890,
  "compareAtPriceCents": 4500,
  "weightGrams": 1400,
  "widthMm": 250,
  "heightMm": 250,
  "lengthMm": 280,
  "physicalQuantity": 190,
  "status": "ACTIVE"
},
  {
  "slug": "fonteplast-sacola-plastica-reforcada-30x40",
  "name": "Sacola Plástica Reforçada Branca 30x40 cm Fonteplast",
  "description": "Fardo com 1.000 sacolas alça camiseta em PEAD virgem. Suporta até 4 kg com excelente resistência a rasgos.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "padaria",
    "lanchonete",
    "delivery",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "fonteplast-sacolas-camiseta",
  "sku": "FON-SAC-3040",
  "priceCents": 4290,
  "compareAtPriceCents": 4990,
  "weightGrams": 3000,
  "widthMm": 300,
  "heightMm": 400,
  "lengthMm": 150,
  "physicalQuantity": 400,
  "status": "ACTIVE"
},
  {
  "slug": "fonteplast-sacola-plastica-reforcada-40x50",
  "name": "Sacola Plástica Alça Camiseta 40x50 cm Fonteplast",
  "description": "Fardo com 1.000 unidades tamanho médio padrão comércio. Excelente elasticidade e resistência a peso.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "padaria",
    "restaurante-buffet",
    "delivery",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "fonteplast-sacolas-camiseta",
  "sku": "FON-SAC-4050",
  "priceCents": 5990,
  "compareAtPriceCents": 6890,
  "weightGrams": 4200,
  "widthMm": 400,
  "heightMm": 500,
  "lengthMm": 160,
  "physicalQuantity": 320,
  "status": "ACTIVE"
},
  {
  "slug": "fonteplast-sacola-supermercado-50x60",
  "name": "Sacola Plástica Extra Forte 50x60 cm Fonteplast",
  "description": "Fardo com 500 sacolas grandes com reforço estrutural nas alças para compras pesadas e mercadorias volumosas.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "bar-distribuidora",
    "padaria",
    "delivery"
  ],
  "tagSlugs": [
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "fonteplast-sacolas-camiseta",
  "sku": "FON-SAC-5060",
  "priceCents": 6490,
  "weightGrams": 4900,
  "widthMm": 500,
  "heightMm": 600,
  "lengthMm": 180,
  "physicalQuantity": 250,
  "status": "ACTIVE"
},
  {
  "slug": "fonteplast-sacola-verde-reciclada-60x80",
  "name": "Sacola Recuperada Resistente 60x80 cm Fardo Fonteplast",
  "description": "Fardo com 250 sacolas extra grandes ecológicas de material reciclado reforçado para grandes volumes.",
  "categorySlugs": [
    "sacos-e-sacolas"
  ],
  "segmentSlugs": [
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "fonteplast-sacolas-camiseta",
  "sku": "FON-SAC-REC-6080",
  "priceCents": 4890,
  "weightGrams": 4500,
  "widthMm": 600,
  "heightMm": 800,
  "lengthMm": 150,
  "physicalQuantity": 210,
  "status": "ACTIVE"
},
  {
  "slug": "fonteplast-sacola-alca-vazada-boca-palhaco-20x30",
  "name": "Sacola Alça Vazada Boca de Palhaço 20x30 cm Fonteplast",
  "description": "Pacote com 100 unidades em polietileno de alta densidade brilhante para lembrancinhas, cosméticos e festas.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "artigos-para-festa"
  ],
  "segmentSlugs": [
    "loja-de-festas",
    "confeitaria-bolos"
  ],
  "tagSlugs": [
    "descartavel"
  ],
  "brandSlug": "fonteplast-sacolas-camiseta",
  "sku": "FON-SAC-VAZ-2030",
  "priceCents": 1890,
  "compareAtPriceCents": 2200,
  "weightGrams": 600,
  "widthMm": 200,
  "heightMm": 300,
  "lengthMm": 40,
  "physicalQuantity": 340,
  "status": "ACTIVE"
},
  {
  "slug": "fonteplast-bobina-picotada-fundo-estrela-28x40",
  "name": "Bobina Picotada Fundo Estrela 28x40 cm Fonteplast",
  "description": "Rolo com 500 sacos picotados transparentes com solda estrela anti-vazamento para carnes, frutas e feiras.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "padaria",
    "restaurante-buffet",
    "delivery"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "fonteplast-bobinas-picotadas",
  "sku": "FON-BOB-PIC-2840",
  "priceCents": 2190,
  "compareAtPriceCents": 2590,
  "weightGrams": 1400,
  "widthMm": 120,
  "heightMm": 280,
  "lengthMm": 120,
  "physicalQuantity": 450,
  "status": "ACTIVE"
},
  {
  "slug": "fonteplast-bobina-picotada-fundo-reto-35x50",
  "name": "Bobina Picotada Rolo Hortifrúti 35x50 cm Fonteplast",
  "description": "Rolo com 500 sacos picotados grandes para açougues, mercados e distribuição de alimentos frescos.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "padaria",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "fonteplast-bobinas-picotadas",
  "sku": "FON-BOB-HORT-3550",
  "priceCents": 2890,
  "compareAtPriceCents": 3350,
  "weightGrams": 2100,
  "widthMm": 130,
  "heightMm": 350,
  "lengthMm": 130,
  "physicalQuantity": 380,
  "status": "ACTIVE"
},
  {
  "slug": "fonteplast-saco-plastico-transparente-pead-15x25",
  "name": "Saco Plástico Transparente PEAD 15x25 cm Fardo 1kg Fonteplast",
  "description": "Pacote de 1 kg com sacos transparentes atóxicos próprios para contato direto com pães, doces e salgados.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "padaria",
    "confeitaria-bolos",
    "lanchonete"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "fonteplast-bobinas-picotadas",
  "sku": "FON-SAC-PEAD-1525",
  "priceCents": 1750,
  "weightGrams": 1000,
  "widthMm": 150,
  "heightMm": 250,
  "lengthMm": 50,
  "physicalQuantity": 290,
  "status": "ACTIVE"
},
  {
  "slug": "fonteplast-saco-para-congelamento-freezer-20x30",
  "name": "Saco para Congelamento e Freezer 20x30 cm Fonteplast",
  "description": "Pacote com 100 unidades em polietileno resistente a temperaturas negativas sem ressecar ou rasgar.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "confeitaria-bolos",
    "padaria"
  ],
  "tagSlugs": [
    "transparente",
    "reforcado"
  ],
  "brandSlug": "fonteplast-bobinas-picotadas",
  "sku": "FON-SAC-FREEZ-2030",
  "priceCents": 1290,
  "weightGrams": 550,
  "widthMm": 200,
  "heightMm": 300,
  "lengthMm": 30,
  "physicalQuantity": 270,
  "status": "ACTIVE"
},
  {
  "slug": "fonteplast-saco-de-lixo-reforcado-100l-preto",
  "name": "Saco de Lixo Industrial Reforçado 100 L Fardo Fonteplast",
  "description": "Fardo com 100 sacos de lixo super reforçados com solda lateral dupla para suportar resíduos úmidos e pesados.",
  "categorySlugs": [
    "produtos-de-limpeza",
    "sacos-e-sacolas"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "lanchonete",
    "pizzaria",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "fonteplast-bobinas-picotadas",
  "sku": "FON-LIXO-100L",
  "priceCents": 3490,
  "compareAtPriceCents": 4100,
  "weightGrams": 2800,
  "widthMm": 300,
  "heightMm": 450,
  "lengthMm": 120,
  "physicalQuantity": 310,
  "status": "ACTIVE"
},
  {
  "slug": "knauf-caixa-termica-isopor-12-litros",
  "name": "Caixa Térmica de Isopor EPS 12 Litros Knauf",
  "description": "Caixa térmica com tampa de vedação hermética para transporte de sobremesas geladas, vacinas e pequenos lanches.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "sorveteria-acai",
    "delivery",
    "confeitaria-bolos"
  ],
  "tagSlugs": [
    "termico"
  ],
  "brandSlug": "knauf-caixas-termicas",
  "sku": "KNA-CX-12L",
  "priceCents": 1690,
  "compareAtPriceCents": 1990,
  "weightGrams": 320,
  "widthMm": 300,
  "heightMm": 220,
  "lengthMm": 380,
  "physicalQuantity": 150,
  "status": "ACTIVE"
},
  {
  "slug": "knauf-caixa-termica-isopor-20-litros",
  "name": "Caixa Térmica de Isopor EPS 20 Litros Knauf",
  "description": "Caixa conservadora térmica para garrafas, latas, refeições quentes e açaí. Excelente espessura de parede.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "bar-distribuidora",
    "sorveteria-acai",
    "delivery"
  ],
  "tagSlugs": [
    "termico"
  ],
  "brandSlug": "knauf-caixas-termicas",
  "sku": "KNA-CX-20L",
  "priceCents": 2390,
  "compareAtPriceCents": 2850,
  "weightGrams": 490,
  "widthMm": 340,
  "heightMm": 290,
  "lengthMm": 420,
  "physicalQuantity": 180,
  "status": "ACTIVE"
},
  {
  "slug": "knauf-caixa-termica-isopor-45-litros",
  "name": "Caixa Térmica de Isopor EPS 45 Litros com Alça Knauf",
  "description": "Caixa com parede grossa e canaleta para tiracolo. Preserva gelo por até 24 horas em eventos e transporte comercial.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "bar-distribuidora",
    "restaurante-buffet",
    "loja-de-festas"
  ],
  "tagSlugs": [
    "termico",
    "reforcado"
  ],
  "brandSlug": "knauf-caixas-termicas",
  "sku": "KNA-CX-45L",
  "priceCents": 4250,
  "compareAtPriceCents": 4990,
  "weightGrams": 850,
  "widthMm": 420,
  "heightMm": 380,
  "lengthMm": 580,
  "physicalQuantity": 130,
  "status": "ACTIVE"
},
  {
  "slug": "knauf-caixa-termica-isopor-80-litros-pesca",
  "name": "Caixa Térmica Reforçada EPS 80 Litros Knauf",
  "description": "Caixa de alta densidade para transporte de pescados frescos, carnes e grandes volumes de bebidas em buffet.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "termico",
    "reforcado"
  ],
  "brandSlug": "knauf-caixas-termicas",
  "sku": "KNA-CX-80L",
  "priceCents": 7890,
  "compareAtPriceCents": 8990,
  "weightGrams": 1600,
  "widthMm": 500,
  "heightMm": 460,
  "lengthMm": 750,
  "physicalQuantity": 90,
  "status": "ACTIVE"
},
  {
  "slug": "knauf-caixa-termica-isopor-120-litros-industrial",
  "name": "Caixa Térmica Extra Grande EPS 120 Litros Knauf",
  "description": "Capacidade máxima de estocagem isotérmica. Paredes de 45 mm ideais para logística refrigerada profissional.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "termico",
    "reforcado"
  ],
  "brandSlug": "knauf-caixas-termicas",
  "sku": "KNA-CX-120L",
  "priceCents": 11900,
  "weightGrams": 2300,
  "widthMm": 580,
  "heightMm": 520,
  "lengthMm": 890,
  "physicalQuantity": 60,
  "status": "ACTIVE"
},
  {
  "slug": "knauf-marmita-termica-isopor-redonda-n8",
  "name": "Marmita Térmica de Isopor Redonda Nº 8 Knauf",
  "description": "Fardo com 100 marmitas térmicas de 700 ml com diâmetro 19 cm. Mantém o almoço fumegante no delivery.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "delivery",
    "lanchonete"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "knauf-marmitas-discos",
  "sku": "KNA-MAR-RED-N8",
  "priceCents": 3890,
  "compareAtPriceCents": 4400,
  "weightGrams": 850,
  "widthMm": 200,
  "heightMm": 450,
  "lengthMm": 200,
  "physicalQuantity": 240,
  "status": "ACTIVE"
},
  {
  "slug": "knauf-marmita-termica-isopor-redonda-n9",
  "name": "Marmita Térmica de Isopor Redonda Nº 9 Grande Knauf",
  "description": "Fardo com 100 unidades tamanho grande 900 ml. Perfeita para refeições completas com carnes, feijão e acompanhamentos.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "delivery"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "knauf-marmitas-discos",
  "sku": "KNA-MAR-RED-N9",
  "priceCents": 4590,
  "compareAtPriceCents": 5200,
  "weightGrams": 980,
  "widthMm": 220,
  "heightMm": 480,
  "lengthMm": 220,
  "physicalQuantity": 210,
  "status": "ACTIVE"
},
  {
  "slug": "knauf-disco-isopor-para-pizza-35cm",
  "name": "Disco Separador Térmico de Isopor para Pizza 35 cm Knauf",
  "description": "Pacote com 100 discos de isopor para posicionar sob a pizza. Evita que o fundo da caixa amoleça e mantém a massa crocante.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "pizzaria",
    "delivery"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "knauf-marmitas-discos",
  "sku": "KNA-DISC-PIZ-35",
  "priceCents": 3290,
  "compareAtPriceCents": 3800,
  "weightGrams": 650,
  "widthMm": 350,
  "heightMm": 120,
  "lengthMm": 350,
  "physicalQuantity": 300,
  "status": "ACTIVE"
},
  {
  "slug": "knauf-placa-isopor-isolamento-termico-20mm",
  "name": "Placa de Isopor EPS Isolamento Térmico 100x50 cm 20 mm Knauf",
  "description": "Fardo com 10 placas térmicas EPS para isolamento de câmaras frias, forros, proteção de produtos e artesanato.",
  "categorySlugs": [
    "embalagens"
  ],
  "segmentSlugs": [
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "termico"
  ],
  "brandSlug": "knauf-marmitas-discos",
  "sku": "KNA-PLA-EPS-20MM",
  "priceCents": 4990,
  "weightGrams": 1400,
  "widthMm": 500,
  "heightMm": 200,
  "lengthMm": 1000,
  "physicalQuantity": 110,
  "status": "ACTIVE"
},
  {
  "slug": "knauf-porta-garrafa-litrao-termico-eps",
  "name": "Porta Garrafa Térmico EPS Litrão e Cerveja Knauf",
  "description": "Pacote com 12 porta-garrafas térmicos para garrafas de 600 ml e 1 litro. Mantém a temperatura no serviço de mesa.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "bar-distribuidora",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "termico"
  ],
  "brandSlug": "knauf-caixas-termicas",
  "sku": "KNA-PORT-GAR-1L",
  "priceCents": 2790,
  "weightGrams": 420,
  "widthMm": 250,
  "heightMm": 300,
  "lengthMm": 350,
  "physicalQuantity": 160,
  "status": "ACTIVE"
},
  {
  "slug": "lanchero-hamburgueira-termica-h01-lanche",
  "name": "Hamburgueira Térmica Simples H-01 Lanchero",
  "description": "Fardo com 100 embalagens térmicas articuladas para hambúrguer simples e cheeseburger. Preserva o queijo derretido.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "lanchero-hamburgueiras",
  "sku": "LAN-HAM-H01",
  "priceCents": 2890,
  "compareAtPriceCents": 3400,
  "weightGrams": 650,
  "widthMm": 150,
  "heightMm": 280,
  "lengthMm": 300,
  "physicalQuantity": 420,
  "status": "ACTIVE"
},
  {
  "slug": "lanchero-hamburgueira-termica-h02-dupla-articulada",
  "name": "Hamburgueira Térmica Articulada H-02 Grande Lanchero",
  "description": "Fardo com 100 unidades tamanho H-02. Ideal para smash burgers duplos, lanches no prato e beirutes.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "lanchero-hamburgueiras",
  "sku": "LAN-HAM-H02",
  "priceCents": 3490,
  "compareAtPriceCents": 3990,
  "weightGrams": 780,
  "widthMm": 170,
  "heightMm": 300,
  "lengthMm": 340,
  "physicalQuantity": 380,
  "status": "ACTIVE"
},
  {
  "slug": "lanchero-hamburgueira-termica-h03-artesanal-monster",
  "name": "Hamburgueira Monster para Burger Artesanal H-03 Lanchero",
  "description": "Fardo com 100 embalagens altas especiais para hambúrguer gourmet artesanal com anéis de cebola e fritas.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "termico",
    "reforcado"
  ],
  "brandSlug": "lanchero-hamburgueiras",
  "sku": "LAN-HAM-H03",
  "priceCents": 4190,
  "compareAtPriceCents": 4800,
  "weightGrams": 920,
  "widthMm": 190,
  "heightMm": 320,
  "lengthMm": 380,
  "physicalQuantity": 290,
  "status": "ACTIVE"
},
  {
  "slug": "lanchero-embalagem-hot-dog-termica-articulada",
  "name": "Embalagem Térmica para Hot Dog Articulada Lanchero",
  "description": "Fardo com 100 embalagens compridas térmicas com trava de segurança para cachorro-quente prensado e tradicional.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "lanchero-hamburgueiras",
  "sku": "LAN-EMB-HOTDOG",
  "priceCents": 2990,
  "weightGrams": 600,
  "widthMm": 120,
  "heightMm": 260,
  "lengthMm": 240,
  "physicalQuantity": 350,
  "status": "ACTIVE"
},
  {
  "slug": "lanchero-caixa-combo-hamburguer-e-fritas",
  "name": "Caixa Combo Hambúrguer e Batata Frita Lanchero",
  "description": "Pacote com 100 caixas em papel cartão kraft com divisória interna para hambúrguer e fritas juntos sem misturar.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "kraft",
    "descartavel"
  ],
  "brandSlug": "lanchero-hamburgueiras",
  "sku": "LAN-CX-COMBO",
  "priceCents": 4890,
  "compareAtPriceCents": 5600,
  "weightGrams": 1600,
  "widthMm": 240,
  "heightMm": 120,
  "lengthMm": 300,
  "physicalQuantity": 220,
  "status": "ACTIVE"
},
  {
  "slug": "lanchero-barca-para-lanches-e-petiscos-m",
  "name": "Barca Descartável para Lanches e Petiscos M Lanchero",
  "description": "Pacote com 50 barcas resistentes para servir porções de batata frita, calabresa e lanches no balcão ou delivery.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "lanchonete",
    "bar-distribuidora",
    "delivery"
  ],
  "tagSlugs": [
    "descartavel",
    "reforcado"
  ],
  "brandSlug": "lanchero-barcas-porcoes",
  "sku": "LAN-BARCA-MED",
  "priceCents": 2350,
  "compareAtPriceCents": 2790,
  "weightGrams": 750,
  "widthMm": 160,
  "heightMm": 80,
  "lengthMm": 280,
  "physicalQuantity": 310,
  "status": "ACTIVE"
},
  {
  "slug": "lanchero-barca-para-lanches-e-porcoes-g",
  "name": "Barca para Mega Porções e Frango a Passarinho G Lanchero",
  "description": "Pacote com 50 barcas grandes com borda reforçada anti-vazamento de gordura para porções familiares.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "lanchonete",
    "bar-distribuidora",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "descartavel",
    "reforcado"
  ],
  "brandSlug": "lanchero-barcas-porcoes",
  "sku": "LAN-BARCA-G",
  "priceCents": 3190,
  "weightGrams": 1050,
  "widthMm": 200,
  "heightMm": 90,
  "lengthMm": 340,
  "physicalQuantity": 240,
  "status": "ACTIVE"
},
  {
  "slug": "lanchero-cone-para-batata-frita-com-porta-molho",
  "name": "Cone Descartável para Batata Frita com Porta Molho Lanchero",
  "description": "Pacote com 100 cones em papel cartão antigordura com encaixe lateral para copinho de maionese ou ketchup.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery",
    "loja-de-festas"
  ],
  "tagSlugs": [
    "descartavel",
    "biodegradavel"
  ],
  "brandSlug": "lanchero-barcas-porcoes",
  "sku": "LAN-CONE-FRITA",
  "priceCents": 2190,
  "compareAtPriceCents": 2600,
  "weightGrams": 620,
  "widthMm": 180,
  "heightMm": 60,
  "lengthMm": 220,
  "physicalQuantity": 360,
  "status": "ACTIVE"
},
  {
  "slug": "lanchero-embalagem-porcao-fritas-e-nuggets-p",
  "name": "Embalagem Pote para Fritas e Porções P Lanchero",
  "description": "Pacote com 100 caixinhas estilo fast food com respiros para manter a batata frita crocante no trajeto.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "descartavel"
  ],
  "brandSlug": "lanchero-barcas-porcoes",
  "sku": "LAN-PORC-FRIT-P",
  "priceCents": 1790,
  "weightGrams": 480,
  "widthMm": 110,
  "heightMm": 130,
  "lengthMm": 60,
  "physicalQuantity": 410,
  "status": "ACTIVE"
},
  {
  "slug": "lanchero-saco-kraft-delivery-lanche-pequeno",
  "name": "Saco Kraft SOS para Lanche e Hambúrguer P Lanchero",
  "description": "Pacote com 250 sacos de papel kraft resistente 80g com fundo quadrado plano para acomodar até 2 lanches.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery",
    "padaria"
  ],
  "tagSlugs": [
    "kraft",
    "biodegradavel",
    "descartavel"
  ],
  "brandSlug": "lanchero-barcas-porcoes",
  "sku": "LAN-SAC-KRAFT-P",
  "priceCents": 3290,
  "compareAtPriceCents": 3800,
  "weightGrams": 1500,
  "widthMm": 180,
  "heightMm": 280,
  "lengthMm": 100,
  "physicalQuantity": 320,
  "status": "ACTIVE"
},
  {
  "slug": "plasan-pote-redondo-com-tampa-250ml",
  "name": "Pote Plástico Redondo com Tampa 250 ml Plasan",
  "description": "Caixa com 100 potes redondos cristal com tampa hermética de alta vedação para doces em calda e sobremesas.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel",
    "vai-ao-micro-ondas"
  ],
  "brandSlug": "plasan-potes-hermeticos",
  "sku": "PLA-POT-RED-250",
  "priceCents": 3490,
  "compareAtPriceCents": 3990,
  "weightGrams": 900,
  "widthMm": 110,
  "heightMm": 350,
  "lengthMm": 110,
  "physicalQuantity": 360,
  "status": "ACTIVE"
},
  {
  "slug": "plasan-pote-redondo-com-tampa-500ml",
  "name": "Pote Redondo Hermético com Tampa 500 ml Plasan",
  "description": "Caixa com 100 potes multiuso resistentes para caldos, sopas, doces e conservas com excelente fechamento.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "delivery",
    "confeitaria-bolos"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel",
    "vai-ao-micro-ondas"
  ],
  "brandSlug": "plasan-potes-hermeticos",
  "sku": "PLA-POT-RED-500",
  "priceCents": 4690,
  "compareAtPriceCents": 5350,
  "weightGrams": 1350,
  "widthMm": 125,
  "heightMm": 420,
  "lengthMm": 125,
  "physicalQuantity": 280,
  "status": "ACTIVE"
},
  {
  "slug": "plasan-pote-redondo-com-tampa-1000ml",
  "name": "Pote Redondo para Alimentos e Sopas 1.000 ml Plasan",
  "description": "Caixa com 100 potes redondos de 1 litro com tampa antivazamento. Ideal para feijoada, caldos e alimentos congelados.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "delivery"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel",
    "vai-ao-micro-ondas",
    "reforcado"
  ],
  "brandSlug": "plasan-potes-hermeticos",
  "sku": "PLA-POT-RED-1000",
  "priceCents": 6290,
  "compareAtPriceCents": 7100,
  "weightGrams": 1900,
  "widthMm": 145,
  "heightMm": 500,
  "lengthMm": 145,
  "physicalQuantity": 210,
  "status": "ACTIVE"
},
  {
  "slug": "plasan-pote-retangular-freezer-micro-500ml",
  "name": "Pote Retangular com Tampa Lacre 500 ml Plasan",
  "description": "Pacote com 50 potes retangulares empilháveis com lacre de segurança no bico. Transparência cristalina.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "delivery",
    "padaria"
  ],
  "tagSlugs": [
    "transparente",
    "vai-ao-micro-ondas"
  ],
  "brandSlug": "plasan-potes-hermeticos",
  "sku": "PLA-POT-RET-500",
  "priceCents": 2890,
  "weightGrams": 780,
  "widthMm": 130,
  "heightMm": 280,
  "lengthMm": 180,
  "physicalQuantity": 330,
  "status": "ACTIVE"
},
  {
  "slug": "plasan-pote-retangular-com-divisoria-refeicao",
  "name": "Pote Retangular com 2 Divisórias para Refeição Plasan",
  "description": "Pacote com 50 unidades com tampa de vedação precisa para separar arroz/feijão da guarnição sem vazar.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "delivery"
  ],
  "tagSlugs": [
    "transparente",
    "vai-ao-micro-ondas",
    "reforcado"
  ],
  "brandSlug": "plasan-potes-hermeticos",
  "sku": "PLA-POT-DIV-2",
  "priceCents": 3690,
  "compareAtPriceCents": 4200,
  "weightGrams": 980,
  "widthMm": 160,
  "heightMm": 300,
  "lengthMm": 220,
  "physicalQuantity": 250,
  "status": "ACTIVE"
},
  {
  "slug": "plasan-molheira-com-tampa-30ml-sushi",
  "name": "Molheira Descartável com Tampa Articulada 30 ml Plasan",
  "description": "Pacote com 100 molheiras pequenas com tampa flip acoplada para shoyu, barbecue, molho tártaro e alho.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "delivery",
    "lanchonete",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "plasan-recipientes-molheiras",
  "sku": "PLA-MOL-30ML",
  "priceCents": 1190,
  "compareAtPriceCents": 1450,
  "weightGrams": 280,
  "widthMm": 60,
  "heightMm": 220,
  "lengthMm": 60,
  "physicalQuantity": 480,
  "status": "ACTIVE"
},
  {
  "slug": "plasan-molheira-com-tampa-60ml-molhos",
  "name": "Pote para Molhos e Shoyu com Tampa 60 ml Plasan",
  "description": "Pacote com 100 unidades em polipropileno cristalino com fechamento por pressão estanque anti-vazamento.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "delivery",
    "lanchonete",
    "pizzaria"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "plasan-recipientes-molheiras",
  "sku": "PLA-MOL-60ML",
  "priceCents": 1490,
  "compareAtPriceCents": 1780,
  "weightGrams": 360,
  "widthMm": 75,
  "heightMm": 240,
  "lengthMm": 75,
  "physicalQuantity": 420,
  "status": "ACTIVE"
},
  {
  "slug": "plasan-molheira-com-tampa-100ml-maionese",
  "name": "Pote Multiuso para Maionese e Patês 100 ml Plasan",
  "description": "Pacote com 100 potes de 100 ml com tampa para porções generosas de maionese caseira, vinagrete e farofa.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "lanchonete",
    "restaurante-buffet",
    "delivery"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "plasan-recipientes-molheiras",
  "sku": "PLA-MOL-100ML",
  "priceCents": 1890,
  "weightGrams": 450,
  "widthMm": 85,
  "heightMm": 260,
  "lengthMm": 85,
  "physicalQuantity": 370,
  "status": "ACTIVE"
},
  {
  "slug": "plasan-tubete-cilindrico-para-especiarias",
  "name": "Recipiente Cilíndrico com Tampa de Pressão 120 ml Plasan",
  "description": "Pacote com 50 recipientes cilíndricos para temperos, castanhas, confeitos de confeitaria e guloseimas.",
  "categorySlugs": [
    "embalagens",
    "artigos-para-festa"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "loja-de-festas"
  ],
  "tagSlugs": [
    "transparente"
  ],
  "brandSlug": "plasan-recipientes-molheiras",
  "sku": "PLA-CIL-120ML",
  "priceCents": 1650,
  "weightGrams": 400,
  "widthMm": 50,
  "heightMm": 200,
  "lengthMm": 50,
  "physicalQuantity": 290,
  "status": "ACTIVE"
},
  {
  "slug": "plasan-embalagem-articulada-sanduiche-triangular",
  "name": "Embalagem Articulada Triangular para Sanduíche Natural Plasan",
  "description": "Pacote com 100 embalagens em formato triângulo com travas nas bordas para expor e vender sanduíches naturais.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "padaria",
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "plasan-recipientes-molheiras",
  "sku": "PLA-EMB-TRIANG",
  "priceCents": 2790,
  "compareAtPriceCents": 3200,
  "weightGrams": 820,
  "widthMm": 140,
  "heightMm": 280,
  "lengthMm": 160,
  "physicalQuantity": 310,
  "status": "ACTIVE"
},
  {
  "slug": "prafesta-pote-retangular-freezer-microondas-500ml",
  "name": "Pote Retangular Freezer e Micro-ondas 500 ml Prafesta",
  "description": "Caixa com 100 unidades em polipropileno atóxico livre de BPA. Suporta variações térmicas extremas sem trincar.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "delivery",
    "confeitaria-bolos"
  ],
  "tagSlugs": [
    "vai-ao-micro-ondas",
    "transparente",
    "reforcado"
  ],
  "brandSlug": "prafesta-freezer-microondas",
  "sku": "PRA-RET-500",
  "priceCents": 4490,
  "compareAtPriceCents": 5190,
  "weightGrams": 1400,
  "widthMm": 140,
  "heightMm": 380,
  "lengthMm": 190,
  "physicalQuantity": 400,
  "status": "ACTIVE"
},
  {
  "slug": "prafesta-pote-retangular-freezer-microondas-750ml",
  "name": "Pote Retangular Freezer e Micro-ondas 750 ml Prafesta",
  "description": "Caixa com 100 potes com tampa de vedação profissional para marmitas congeladas fitness e refeições completas.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "delivery"
  ],
  "tagSlugs": [
    "vai-ao-micro-ondas",
    "transparente",
    "reforcado"
  ],
  "brandSlug": "prafesta-freezer-microondas",
  "sku": "PRA-RET-750",
  "priceCents": 5290,
  "compareAtPriceCents": 5990,
  "weightGrams": 1680,
  "widthMm": 140,
  "heightMm": 420,
  "lengthMm": 190,
  "physicalQuantity": 350,
  "status": "ACTIVE"
},
  {
  "slug": "prafesta-pote-retangular-freezer-microondas-1000ml",
  "name": "Pote Retangular Freezer e Micro-ondas 1.000 ml Prafesta",
  "description": "Caixa com 100 potes grandes de 1 litro para lasanhas, escondidinhos, massas e comida caseira no delivery.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "delivery",
    "pizzaria"
  ],
  "tagSlugs": [
    "vai-ao-micro-ondas",
    "transparente",
    "reforcado"
  ],
  "brandSlug": "prafesta-freezer-microondas",
  "sku": "PRA-RET-1000",
  "priceCents": 6390,
  "compareAtPriceCents": 7200,
  "weightGrams": 2100,
  "widthMm": 150,
  "heightMm": 460,
  "lengthMm": 210,
  "physicalQuantity": 280,
  "status": "ACTIVE"
},
  {
  "slug": "prafesta-pote-redondo-com-tampa-250ml-linha-gold",
  "name": "Pote Redondo Sobremesa Linha Gold 250 ml Prafesta",
  "description": "Pacote com 50 potes redondos ultra cristalinos para mousses, bolos de pote e pavês de confeitaria requintada.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria",
    "loja-de-festas"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "prafesta-freezer-microondas",
  "sku": "PRA-RED-250",
  "priceCents": 1990,
  "compareAtPriceCents": 2390,
  "weightGrams": 520,
  "widthMm": 105,
  "heightMm": 280,
  "lengthMm": 105,
  "physicalQuantity": 360,
  "status": "ACTIVE"
},
  {
  "slug": "prafesta-pote-redondo-com-tampa-500ml-linha-gold",
  "name": "Pote Redondo Sobremesa Linha Gold 500 ml Prafesta",
  "description": "Pacote com 50 unidades de meio litro com tampa hermética. Visual brilhante valoriza a apresentação do doce.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "prafesta-freezer-microondas",
  "sku": "PRA-RED-500",
  "priceCents": 2690,
  "weightGrams": 740,
  "widthMm": 120,
  "heightMm": 320,
  "lengthMm": 120,
  "physicalQuantity": 310,
  "status": "ACTIVE"
},
  {
  "slug": "prafesta-prato-plastico-raso-15cm-festa",
  "name": "Prato Plástico Descartável Raso 15 cm Sobremesa Prafesta",
  "description": "Pacote com 50 pratinhos plásticos resistentes brancos para bolos de aniversário e salgadinhos em comemorações.",
  "categorySlugs": [
    "artigos-para-festa",
    "descartaveis",
    "pratos"
  ],
  "segmentSlugs": [
    "loja-de-festas",
    "confeitaria-bolos",
    "padaria"
  ],
  "tagSlugs": [
    "descartavel"
  ],
  "brandSlug": "prafesta-artigos-festa",
  "sku": "PRA-PRA-15CM",
  "priceCents": 650,
  "compareAtPriceCents": 850,
  "weightGrams": 280,
  "widthMm": 150,
  "heightMm": 80,
  "lengthMm": 150,
  "physicalQuantity": 550,
  "status": "ACTIVE"
},
  {
  "slug": "prafesta-prato-plastico-refeicao-21cm-reforcado",
  "name": "Prato Plástico Reforçado Refeição 21 cm Prafesta",
  "description": "Pacote com 50 pratos fundos/refeição extra resistentes. Suporta alimentos pesados e molhos sem dobrar.",
  "categorySlugs": [
    "descartaveis",
    "pratos",
    "artigos-para-festa"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "loja-de-festas",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "prafesta-artigos-festa",
  "sku": "PRA-PRA-21CM",
  "priceCents": 1490,
  "compareAtPriceCents": 1790,
  "weightGrams": 580,
  "widthMm": 210,
  "heightMm": 110,
  "lengthMm": 210,
  "physicalQuantity": 440,
  "status": "ACTIVE"
},
  {
  "slug": "prafesta-garfo-refeicao-reforcado-cristal",
  "name": "Garfo Descartável Linha Cristal Refeição Prafesta",
  "description": "Pacote com 50 garfos transparentes em poliestireno virgem premium. Dentes afiados e firmeza ao cortar carnes.",
  "categorySlugs": [
    "descartaveis",
    "artigos-para-festa"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "loja-de-festas",
    "delivery"
  ],
  "tagSlugs": [
    "transparente",
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "prafesta-artigos-festa",
  "sku": "PRA-GARF-CRIS",
  "priceCents": 990,
  "compareAtPriceCents": 1250,
  "weightGrams": 260,
  "widthMm": 100,
  "heightMm": 40,
  "lengthMm": 190,
  "physicalQuantity": 480,
  "status": "ACTIVE"
},
  {
  "slug": "prafesta-faca-refeicao-reforcada-cristal",
  "name": "Faca Descartável Linha Cristal Reforçada Prafesta",
  "description": "Pacote com 50 facas de corte com serra precisa. Alta rigidez para churrascos, eventos e delivery.",
  "categorySlugs": [
    "descartaveis",
    "artigos-para-festa"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "loja-de-festas",
    "delivery"
  ],
  "tagSlugs": [
    "transparente",
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "prafesta-artigos-festa",
  "sku": "PRA-FAC-CRIS",
  "priceCents": 990,
  "compareAtPriceCents": 1250,
  "weightGrams": 270,
  "widthMm": 100,
  "heightMm": 40,
  "lengthMm": 190,
  "physicalQuantity": 460,
  "status": "ACTIVE"
},
  {
  "slug": "prafesta-colher-sobremesa-linha-cristal",
  "name": "Colher de Sobremesa Descartável Cristal Prafesta",
  "description": "Pacote com 50 colheres cristal resistente para tortas, açaí, mousses e sorvetes com bordas arredondadas e confortáveis.",
  "categorySlugs": [
    "descartaveis",
    "artigos-para-festa"
  ],
  "segmentSlugs": [
    "sorveteria-acai",
    "confeitaria-bolos",
    "loja-de-festas"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "prafesta-artigos-festa",
  "sku": "PRA-COL-CRIS",
  "priceCents": 850,
  "weightGrams": 220,
  "widthMm": 90,
  "heightMm": 40,
  "lengthMm": 160,
  "physicalQuantity": 510,
  "status": "ACTIVE"
},
  {
  "slug": "segplast-filme-pvc-esticavel-28cm-100m",
  "name": "Filme de PVC Esticável Culinário 28 cm x 100 m Segplast",
  "description": "Caixa com trilho e lâmina de corte deslizante. Aderência instantânea e barreira de oxigênio para manter alimentos frescos.",
  "categorySlugs": [
    "embalagens",
    "filme-e-aluminio"
  ],
  "segmentSlugs": [
    "padaria",
    "restaurante-buffet",
    "delivery"
  ],
  "tagSlugs": [
    "transparente",
    "reforcado"
  ],
  "brandSlug": "segplast-filmes-stretch-pvc",
  "sku": "SEG-PVC-28-100",
  "priceCents": 1390,
  "compareAtPriceCents": 1650,
  "weightGrams": 420,
  "widthMm": 310,
  "heightMm": 60,
  "lengthMm": 60,
  "physicalQuantity": 380,
  "status": "ACTIVE"
},
  {
  "slug": "segplast-filme-pvc-esticavel-38cm-300m",
  "name": "Filme de PVC Esticável Profissional 38 cm x 300 m Segplast",
  "description": "Rolo profissional de 300 metros para embaladoras manuais de supermercados, padarias e açougues.",
  "categorySlugs": [
    "embalagens",
    "filme-e-aluminio"
  ],
  "segmentSlugs": [
    "padaria",
    "restaurante-buffet",
    "pizzaria"
  ],
  "tagSlugs": [
    "transparente",
    "reforcado"
  ],
  "brandSlug": "segplast-filmes-stretch-pvc",
  "sku": "SEG-PVC-38-300",
  "priceCents": 2990,
  "compareAtPriceCents": 3500,
  "weightGrams": 1450,
  "widthMm": 100,
  "heightMm": 410,
  "lengthMm": 100,
  "physicalQuantity": 290,
  "status": "ACTIVE"
},
  {
  "slug": "segplast-filme-pvc-esticavel-45cm-1000m-bobina",
  "name": "Bobina Filme de PVC Industrial 45 cm x 1.000 m Segplast",
  "description": "Bobina pesada de 1.000 metros de alta extensão para máquinas automáticas e seladoras industriais.",
  "categorySlugs": [
    "embalagens",
    "filme-e-aluminio"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "padaria"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "segplast-filmes-stretch-pvc",
  "sku": "SEG-PVC-45-1000",
  "priceCents": 7490,
  "compareAtPriceCents": 8500,
  "weightGrams": 4800,
  "widthMm": 150,
  "heightMm": 480,
  "lengthMm": 150,
  "physicalQuantity": 140,
  "status": "ACTIVE"
},
  {
  "slug": "segplast-filme-stretch-manual-com-tubete-500mm",
  "name": "Filme Stretch Manual para Paletização 500 mm x 25 mic Segplast",
  "description": "Bobina de filme stretch virgem com tubete de papelão. Alta retenção de carga e resistência contra perfuração de cantoneiras.",
  "categorySlugs": [
    "embalagens",
    "filme-e-aluminio"
  ],
  "segmentSlugs": [
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "segplast-filmes-stretch-pvc",
  "sku": "SEG-STR-MAN-500",
  "priceCents": 4390,
  "compareAtPriceCents": 4990,
  "weightGrams": 3200,
  "widthMm": 120,
  "heightMm": 520,
  "lengthMm": 120,
  "physicalQuantity": 220,
  "status": "ACTIVE"
},
  {
  "slug": "segplast-filme-stretch-sem-tubete-ecologico",
  "name": "Filme Stretch Ecológico sem Tubete Coreless Segplast",
  "description": "Rolo de filme stretch sem tubete de papelão interno. 100% do peso em plástico útil, sem resíduos sólidos descartados.",
  "categorySlugs": [
    "embalagens"
  ],
  "segmentSlugs": [
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "reforcado",
    "biodegradavel"
  ],
  "brandSlug": "segplast-filmes-stretch-pvc",
  "sku": "SEG-STR-ECO-500",
  "priceCents": 4190,
  "weightGrams": 3000,
  "widthMm": 110,
  "heightMm": 500,
  "lengthMm": 110,
  "physicalQuantity": 180,
  "status": "ACTIVE"
},
  {
  "slug": "segplast-fita-adesiva-transparente-48mm-45m",
  "name": "Fita Adesiva Transparente para Embalagem 48 mm x 45 m Segplast",
  "description": "Pacote com 6 rolos de fita adesiva acrílica transparente com alto poder de fixação em caixas de papelão.",
  "categorySlugs": [
    "embalagens"
  ],
  "segmentSlugs": [
    "delivery",
    "padaria",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "segplast-fitas-adesivas",
  "sku": "SEG-FIT-TRA-4845",
  "priceCents": 2190,
  "compareAtPriceCents": 2600,
  "weightGrams": 750,
  "widthMm": 100,
  "heightMm": 290,
  "lengthMm": 100,
  "physicalQuantity": 410,
  "status": "ACTIVE"
},
  {
  "slug": "segplast-fita-adesiva-marrom-kraft-48mm-100m",
  "name": "Fita Adesiva Marrom para Fechamento de Caixas 48 mm x 100 m Segplast",
  "description": "Pacote com 6 rolos de fita marrom para empacotamento seguro e vedação discreta em caixas de papelão.",
  "categorySlugs": [
    "embalagens"
  ],
  "segmentSlugs": [
    "delivery",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "segplast-fitas-adesivas",
  "sku": "SEG-FIT-MAR-48100",
  "priceCents": 3890,
  "weightGrams": 1400,
  "widthMm": 120,
  "heightMm": 290,
  "lengthMm": 120,
  "physicalQuantity": 270,
  "status": "ACTIVE"
},
  {
  "slug": "segplast-fita-gomada-com-reforco-de-nylon-70mm",
  "name": "Fita Gomada com Reforço de Fios de Nylon 70 mm Segplast",
  "description": "Rolo de 150 metros de papel kraft gomado com filamentos de fibra de vidro trançada. Fechamento inviolável.",
  "categorySlugs": [
    "embalagens"
  ],
  "segmentSlugs": [
    "delivery",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "kraft",
    "reforcado"
  ],
  "brandSlug": "segplast-fitas-adesivas",
  "sku": "SEG-FIT-GOM-70",
  "priceCents": 3490,
  "compareAtPriceCents": 4100,
  "weightGrams": 1100,
  "widthMm": 180,
  "heightMm": 70,
  "lengthMm": 180,
  "physicalQuantity": 190,
  "status": "ACTIVE"
},
  {
  "slug": "segplast-lacre-de-seguranca-inviolavel-delivery",
  "name": "Rolo de Lacre de Segurança Inviolável Delivery Segplast",
  "description": "Rolo com 1.000 etiquetas adesivas picotadas que rasgam ao tentar abrir. Transmite confiança total ao cliente final.",
  "categorySlugs": [
    "embalagens"
  ],
  "segmentSlugs": [
    "delivery",
    "pizzaria",
    "lanchonete"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "segplast-fitas-adesivas",
  "sku": "SEG-LAC-DELIV-1000",
  "priceCents": 2650,
  "compareAtPriceCents": 3100,
  "weightGrams": 450,
  "widthMm": 100,
  "heightMm": 100,
  "lengthMm": 40,
  "physicalQuantity": 380,
  "status": "ACTIVE"
},
  {
  "slug": "segplast-fita-demarcacao-de-solo-zebrada-50mm",
  "name": "Fita de Demarcação e Sinalização Zebrada 50 mm x 30 m Segplast",
  "description": "Rolo de fita adesiva amarela e preta em PVC emborrachado resistente ao atrito de empilhadeiras e fluxo de pedestres.",
  "categorySlugs": [
    "embalagens",
    "produtos-de-limpeza"
  ],
  "segmentSlugs": [
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "segplast-fitas-adesivas",
  "sku": "SEG-FIT-ZEB-5030",
  "priceCents": 2490,
  "weightGrams": 350,
  "widthMm": 110,
  "heightMm": 50,
  "lengthMm": 110,
  "physicalQuantity": 160,
  "status": "ACTIVE"
},
  {
  "slug": "sicao-chocolate-nobre-ao-leite-barra-1kg",
  "name": "Chocolate Nobre em Barra Ao Leite 1,01 kg Sicao",
  "description": "Barra de chocolate nobre puro cacau sabor suave e aveludado. Ideal para moldar bombons, trufas e ovos de Páscoa.",
  "categorySlugs": [
    "doces-e-bomboniere",
    "mercearia"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "sicao-chocolates-barras",
  "sku": "SIC-NOB-LEI-1KG",
  "priceCents": 4490,
  "compareAtPriceCents": 5190,
  "weightGrams": 1010,
  "widthMm": 140,
  "heightMm": 25,
  "lengthMm": 280,
  "physicalQuantity": 300,
  "status": "ACTIVE"
},
  {
  "slug": "sicao-chocolate-nobre-meio-amargo-barra-1kg",
  "name": "Chocolate Nobre Meio Amargo Barra 1,01 kg Sicao",
  "description": "Barra de chocolate nobre com teor equilibrado de cacau. Proporciona brilho excepcional e quebra perfeita na têmpera.",
  "categorySlugs": [
    "doces-e-bomboniere",
    "mercearia"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "sicao-chocolates-barras",
  "sku": "SIC-NOB-MAM-1KG",
  "priceCents": 4590,
  "compareAtPriceCents": 5290,
  "weightGrams": 1010,
  "widthMm": 140,
  "heightMm": 25,
  "lengthMm": 280,
  "physicalQuantity": 280,
  "status": "ACTIVE"
},
  {
  "slug": "sicao-chocolate-nobre-branco-barra-1kg",
  "name": "Chocolate Nobre Branco Puro Cacau Barra 1,01 kg Sicao",
  "description": "Barra de chocolate branco com manteiga de cacau de primeira qualidade e notas pronunciadas de baunilha.",
  "categorySlugs": [
    "doces-e-bomboniere",
    "mercearia"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "sicao-chocolates-barras",
  "sku": "SIC-NOB-BRA-1KG",
  "priceCents": 4790,
  "weightGrams": 1010,
  "widthMm": 140,
  "heightMm": 25,
  "lengthMm": 280,
  "physicalQuantity": 220,
  "status": "ACTIVE"
},
  {
  "slug": "sicao-cobertura-fracionada-gotas-ao-leite-1kg",
  "name": "Cobertura Fracionada Mais Gotas Ao Leite 1,01 kg Sicao",
  "description": "Gotas fracionadas fáceis de dosar e derreter. Não necessita têmpera; oferece secagem rápida e brilho duradouro.",
  "categorySlugs": [
    "doces-e-bomboniere",
    "mercearia"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria",
    "loja-de-festas"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "sicao-chocolates-barras",
  "sku": "SIC-COB-LEI-1KG",
  "priceCents": 2990,
  "compareAtPriceCents": 3450,
  "weightGrams": 1010,
  "widthMm": 160,
  "heightMm": 45,
  "lengthMm": 240,
  "physicalQuantity": 420,
  "status": "ACTIVE"
},
  {
  "slug": "sicao-cobertura-fracionada-gotas-meio-amargo-1kg",
  "name": "Cobertura Fracionada Mais Gotas Meio Amargo 1,01 kg Sicao",
  "description": "Gotas fracionadas com sabor intenso de cacau. Perfeita para banho em pães de mel, cones recheados e espetinhos de frutas.",
  "categorySlugs": [
    "doces-e-bomboniere",
    "mercearia"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "sicao-chocolates-barras",
  "sku": "SIC-COB-MAM-1KG",
  "priceCents": 2990,
  "compareAtPriceCents": 3450,
  "weightGrams": 1010,
  "widthMm": 160,
  "heightMm": 45,
  "lengthMm": 240,
  "physicalQuantity": 390,
  "status": "ACTIVE"
},
  {
  "slug": "sicao-gotas-de-chocolate-forneaveis-ao-leite-1kg",
  "name": "Gotas de Chocolate Forneáveis Ao Leite 1,01 kg Sicao",
  "description": "Gotas especiais que mantêm o formato perfeito e textura macia no forno até 200°C. Indispensável para panetones e cookies.",
  "categorySlugs": [
    "doces-e-bomboniere",
    "mercearia"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "sicao-gotas-coberturas",
  "sku": "SIC-GOT-FORN-1KG",
  "priceCents": 3590,
  "compareAtPriceCents": 4100,
  "weightGrams": 1010,
  "widthMm": 160,
  "heightMm": 50,
  "lengthMm": 240,
  "physicalQuantity": 340,
  "status": "ACTIVE"
},
  {
  "slug": "sicao-gotas-de-chocolate-forneaveis-amargo-1kg",
  "name": "Gotas de Chocolate Forneáveis Amargas 1,01 kg Sicao",
  "description": "Gotas de chocolate meio amargo resistentes a altas temperaturas para bolos mesclados, muffins e pães doces artesanais.",
  "categorySlugs": [
    "doces-e-bomboniere",
    "mercearia"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "sicao-gotas-coberturas",
  "sku": "SIC-GOT-FORN-AM-1KG",
  "priceCents": 3690,
  "weightGrams": 1010,
  "widthMm": 160,
  "heightMm": 50,
  "lengthMm": 240,
  "physicalQuantity": 310,
  "status": "ACTIVE"
},
  {
  "slug": "sicao-cacau-em-po-100-puro-alcalino-500g",
  "name": "Cacau em Pó 100% Puro Alcalino 500 g Sicao",
  "description": "Cacau alcalino com cor castanho-escura profunda e alta solubilidade em massas, caldas, brigadeiros gourmet e brownies.",
  "categorySlugs": [
    "doces-e-bomboniere",
    "mercearia"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "sicao-gotas-coberturas",
  "sku": "SIC-CACAU-100-500G",
  "priceCents": 2790,
  "compareAtPriceCents": 3200,
  "weightGrams": 500,
  "widthMm": 130,
  "heightMm": 210,
  "lengthMm": 60,
  "physicalQuantity": 280,
  "status": "ACTIVE"
},
  {
  "slug": "sicao-chocolate-em-po-50-cacau-1kg",
  "name": "Chocolate em Pó Solúvel 50% Cacau 1,01 kg Sicao",
  "description": "Blend equilibrado de cacau e açúcar para recheios, coberturas, bebidas achocolatadas e massas de bolo fofinhas.",
  "categorySlugs": [
    "doces-e-bomboniere",
    "mercearia"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "sicao-gotas-coberturas",
  "sku": "SIC-CHO-50-1KG",
  "priceCents": 3150,
  "weightGrams": 1010,
  "widthMm": 150,
  "heightMm": 240,
  "lengthMm": 70,
  "physicalQuantity": 290,
  "status": "ACTIVE"
},
  {
  "slug": "sicao-pasta-recheio-forneavel-avela-1kg",
  "name": "Creme de Chocolate com Avelã Forneável 1,01 kg Sicao",
  "description": "Recheio cremoso pronto com avelãs selecionadas. Estável ao forneamento em pizzas doces, pastéis e croissants.",
  "categorySlugs": [
    "doces-e-bomboniere",
    "mercearia"
  ],
  "segmentSlugs": [
    "pizzaria",
    "confeitaria-bolos",
    "padaria"
  ],
  "tagSlugs": [
    "reforcado"
  ],
  "brandSlug": "sicao-gotas-coberturas",
  "sku": "SIC-CRE-AVE-1KG",
  "priceCents": 4190,
  "compareAtPriceCents": 4890,
  "weightGrams": 1010,
  "widthMm": 120,
  "heightMm": 140,
  "lengthMm": 120,
  "physicalQuantity": 250,
  "status": "ACTIVE"
},
  {
  "slug": "techplast-copo-descartavel-pp-180ml-agua",
  "name": "Copo Plástico Descartável PP 180 ml com 100 unid Techplast",
  "description": "Tira com 100 copos plásticos translúcidos em polipropileno de alta maleabilidade para dispensadores de água em empresas.",
  "categorySlugs": [
    "descartaveis",
    "copos"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "lanchonete",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "techplast-copos-descartaveis",
  "sku": "TEC-COP-180ML",
  "priceCents": 590,
  "compareAtPriceCents": 750,
  "weightGrams": 380,
  "widthMm": 180,
  "heightMm": 280,
  "lengthMm": 180,
  "physicalQuantity": 600,
  "status": "ACTIVE"
},
  {
  "slug": "techplast-copo-descartavel-pp-200ml-transparente",
  "name": "Copo Descartável PP 200 ml Transparente Techplast",
  "description": "Tira com 100 copos com frisos anatômicos reforçados. Ideal para água, sucos e refrigerantes em escritórios e eventos.",
  "categorySlugs": [
    "descartaveis",
    "copos"
  ],
  "segmentSlugs": [
    "lanchonete",
    "loja-de-festas",
    "restaurante-buffet",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "descartavel",
    "transparente"
  ],
  "brandSlug": "techplast-copos-descartaveis",
  "sku": "TEC-COP-200ML",
  "priceCents": 680,
  "compareAtPriceCents": 820,
  "weightGrams": 420,
  "widthMm": 200,
  "heightMm": 300,
  "lengthMm": 200,
  "physicalQuantity": 550,
  "status": "ACTIVE"
},
  {
  "slug": "techplast-copo-descartavel-pp-300ml-suco",
  "name": "Copo Descartável PP 300 ml para Sucos Techplast",
  "description": "Pacote com 100 unidades com diâmetro padrão e boa rigidez nas bordas para consumo imediato de refrigerantes e refrescos.",
  "categorySlugs": [
    "descartaveis",
    "copos"
  ],
  "segmentSlugs": [
    "lanchonete",
    "bar-distribuidora",
    "loja-de-festas"
  ],
  "tagSlugs": [
    "descartavel",
    "transparente"
  ],
  "brandSlug": "techplast-copos-descartaveis",
  "sku": "TEC-COP-300ML",
  "priceCents": 950,
  "compareAtPriceCents": 1150,
  "weightGrams": 590,
  "widthMm": 240,
  "heightMm": 350,
  "lengthMm": 240,
  "physicalQuantity": 420,
  "status": "ACTIVE"
},
  {
  "slug": "techplast-copo-descartavel-ps-cristal-500ml",
  "name": "Copo Descartável PS Cristal Reforçado 500 ml Techplast",
  "description": "Pacote com 50 copos em poliestireno ultra rígido com transparência total de vidro para chopp, cerveja e caipirinhas.",
  "categorySlugs": [
    "descartaveis",
    "copos"
  ],
  "segmentSlugs": [
    "bar-distribuidora",
    "loja-de-festas",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "transparente",
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "techplast-copos-descartaveis",
  "sku": "TEC-COP-500ML",
  "priceCents": 1590,
  "compareAtPriceCents": 1890,
  "weightGrams": 750,
  "widthMm": 260,
  "heightMm": 360,
  "lengthMm": 260,
  "physicalQuantity": 360,
  "status": "ACTIVE"
},
  {
  "slug": "techplast-tampa-reta-com-furo-copo-300-500ml",
  "name": "Tampa Plástica Reta com Furo para Copos Techplast",
  "description": "Pacote com 100 tampas retas com furo em cruz para canudo. Encaixe firme que evita vazamentos em copos de suco e refri.",
  "categorySlugs": [
    "descartaveis",
    "copos"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery",
    "bar-distribuidora"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "techplast-copos-descartaveis",
  "sku": "TEC-TAM-RETA-FURO",
  "priceCents": 890,
  "weightGrams": 280,
  "widthMm": 180,
  "heightMm": 220,
  "lengthMm": 180,
  "physicalQuantity": 410,
  "status": "ACTIVE"
},
  {
  "slug": "techplast-prato-festa-raso-18cm-reforcado",
  "name": "Prato Descartável Raso para Refeição 18 cm Techplast",
  "description": "Pacote com 50 pratos plásticos brancos reforçados com abas reforçadas para almoço, jantares e eventos corporativos.",
  "categorySlugs": [
    "descartaveis",
    "pratos"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "loja-de-festas"
  ],
  "tagSlugs": [
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "techplast-pratos-talheres",
  "sku": "TEC-PRA-18CM",
  "priceCents": 1190,
  "compareAtPriceCents": 1400,
  "weightGrams": 450,
  "widthMm": 180,
  "heightMm": 90,
  "lengthMm": 180,
  "physicalQuantity": 380,
  "status": "ACTIVE"
},
  {
  "slug": "techplast-prato-festa-fundo-15cm-caldos",
  "name": "Prato Plástico Fundo 15 cm para Caldos e Sopas Techplast",
  "description": "Pacote com 50 pratos fundos descartáveis resistentes a líquidos aquecidos. Ideal para canjas, tacacá e caldos.",
  "categorySlugs": [
    "descartaveis",
    "pratos"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "lanchonete"
  ],
  "tagSlugs": [
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "techplast-pratos-talheres",
  "sku": "TEC-PRA-FND-15CM",
  "priceCents": 990,
  "weightGrams": 390,
  "widthMm": 150,
  "heightMm": 80,
  "lengthMm": 150,
  "physicalQuantity": 340,
  "status": "ACTIVE"
},
  {
  "slug": "techplast-garfo-master-refeicao-fardo-50un",
  "name": "Garfo Descartável Linha Master Reforçado Techplast",
  "description": "Pacote com 50 garfos brancos pesados master com dentes estruturados para refeições completas.",
  "categorySlugs": [
    "descartaveis"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "techplast-pratos-talheres",
  "sku": "TEC-GAR-MAST-50",
  "priceCents": 790,
  "compareAtPriceCents": 980,
  "weightGrams": 240,
  "widthMm": 80,
  "heightMm": 35,
  "lengthMm": 180,
  "physicalQuantity": 520,
  "status": "ACTIVE"
},
  {
  "slug": "techplast-faca-master-refeicao-fardo-50un",
  "name": "Faca Descartável Linha Master de Corte Techplast",
  "description": "Pacote com 50 facas de corte reforçado que cortam carnes com eficiência sem vergadura excessiva.",
  "categorySlugs": [
    "descartaveis"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "techplast-pratos-talheres",
  "sku": "TEC-FAC-MAST-50",
  "priceCents": 790,
  "compareAtPriceCents": 980,
  "weightGrams": 250,
  "widthMm": 80,
  "heightMm": 35,
  "lengthMm": 180,
  "physicalQuantity": 500,
  "status": "ACTIVE"
},
  {
  "slug": "techplast-colher-master-sopa-fardo-50un",
  "name": "Colher Descartável Linha Master Refeição Techplast",
  "description": "Pacote com 50 colheres grandes para caldos, sopas e sobremesas com concha profunda.",
  "categorySlugs": [
    "descartaveis"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "lanchonete"
  ],
  "tagSlugs": [
    "descartavel"
  ],
  "brandSlug": "techplast-pratos-talheres",
  "sku": "TEC-COL-MAST-50",
  "priceCents": 750,
  "weightGrams": 230,
  "widthMm": 80,
  "heightMm": 35,
  "lengthMm": 170,
  "physicalQuantity": 470,
  "status": "ACTIVE"
},
  {
  "slug": "totalplast-copo-termico-eps-180ml-cafe",
  "name": "Copo Térmico EPS 180 ml para Bebidas Quentes Totalplast",
  "description": "Pacote com 50 copos térmicos de isopor 180 ml. Mantém o café quente sem queimar as mãos de quem segura.",
  "categorySlugs": [
    "descartaveis",
    "copos",
    "embalagens"
  ],
  "segmentSlugs": [
    "padaria",
    "lanchonete",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "totalplast-copos-potes-termicos",
  "sku": "TOT-COP-TER-180",
  "priceCents": 990,
  "compareAtPriceCents": 1200,
  "weightGrams": 290,
  "widthMm": 160,
  "heightMm": 240,
  "lengthMm": 160,
  "physicalQuantity": 410,
  "status": "ACTIVE"
},
  {
  "slug": "totalplast-copo-termico-eps-240ml-cappuccino",
  "name": "Copo Térmico EPS 240 ml com Isolamento Totalplast",
  "description": "Pacote com 50 copos de 240 ml. Perfeito para cappuccinos, chás e caldos individuais em cafeterias e delivery.",
  "categorySlugs": [
    "descartaveis",
    "copos",
    "embalagens"
  ],
  "segmentSlugs": [
    "padaria",
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "totalplast-copos-potes-termicos",
  "sku": "TOT-COP-TER-240",
  "priceCents": 1190,
  "compareAtPriceCents": 1450,
  "weightGrams": 350,
  "widthMm": 180,
  "heightMm": 260,
  "lengthMm": 180,
  "physicalQuantity": 370,
  "status": "ACTIVE"
},
  {
  "slug": "totalplast-copo-termico-eps-300ml-caldos",
  "name": "Copo Térmico EPS 300 ml para Caldos e Sopas Totalplast",
  "description": "Pacote com 50 unidades de 300 ml com parede reforçada isotérmica. Mantém quente até o momento do consumo no delivery.",
  "categorySlugs": [
    "descartaveis",
    "copos",
    "embalagens"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "termico",
    "descartavel",
    "reforcado"
  ],
  "brandSlug": "totalplast-copos-potes-termicos",
  "sku": "TOT-COP-TER-300",
  "priceCents": 1450,
  "compareAtPriceCents": 1720,
  "weightGrams": 420,
  "widthMm": 200,
  "heightMm": 280,
  "lengthMm": 200,
  "physicalQuantity": 320,
  "status": "ACTIVE"
},
  {
  "slug": "totalplast-pote-termico-eps-500ml-com-tampa",
  "name": "Pote Térmico EPS 500 ml com Tampa Térmica Totalplast",
  "description": "Pacote com 25 conjuntos de pote e tampa em isopor para sopas, caldos verdes e açaí com excelente retenção de temperatura.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "sorveteria-acai",
    "delivery",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "totalplast-copos-potes-termicos",
  "sku": "TOT-POT-TER-500",
  "priceCents": 1790,
  "compareAtPriceCents": 2100,
  "weightGrams": 380,
  "widthMm": 220,
  "heightMm": 260,
  "lengthMm": 220,
  "physicalQuantity": 300,
  "status": "ACTIVE"
},
  {
  "slug": "totalplast-tampa-bico-viagem-copo-termico-240ml",
  "name": "Tampa com Bico Viagem para Copo Térmico Totalplast",
  "description": "Pacote com 100 tampas plásticas tipo viagem (sip lid) com abertura para beber direto no copo sem derramar.",
  "categorySlugs": [
    "descartaveis",
    "copos"
  ],
  "segmentSlugs": [
    "padaria",
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "descartavel"
  ],
  "brandSlug": "totalplast-copos-potes-termicos",
  "sku": "TOT-TAM-BICO-240",
  "priceCents": 1390,
  "weightGrams": 280,
  "widthMm": 160,
  "heightMm": 200,
  "lengthMm": 160,
  "physicalQuantity": 360,
  "status": "ACTIVE"
},
  {
  "slug": "totalplast-bandeja-isopor-rasa-b01",
  "name": "Bandeja de Isopor EPS Rasa B-01 Fardo com 400 Totalplast",
  "description": "Fardo com 400 bandejas brancas rasas de 15x15 cm para frios fatiados, queijos, presuntos e frutas embaladas.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "padaria",
    "frios-e-laticinios",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "totalplast-bandejas-isopor",
  "sku": "TOT-BAN-B01",
  "priceCents": 3790,
  "compareAtPriceCents": 4350,
  "weightGrams": 1500,
  "widthMm": 320,
  "heightMm": 450,
  "lengthMm": 320,
  "physicalQuantity": 280,
  "status": "ACTIVE"
},
  {
  "slug": "totalplast-bandeja-isopor-funda-b02",
  "name": "Bandeja de Isopor EPS Funda B-02 para Carnes Totalplast",
  "description": "Fardo com 400 bandejas fundas com abas para retenção de líquidos de carnes frescas, frangos e peixes embalados com filme.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "padaria",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "totalplast-bandejas-isopor",
  "sku": "TOT-BAN-B02",
  "priceCents": 4490,
  "compareAtPriceCents": 5100,
  "weightGrams": 1800,
  "widthMm": 340,
  "heightMm": 480,
  "lengthMm": 340,
  "physicalQuantity": 240,
  "status": "ACTIVE"
},
  {
  "slug": "totalplast-bandeja-isopor-b03-frios-e-hortifruti",
  "name": "Bandeja de Isopor EPS Grande B-03 Hortifrúti Totalplast",
  "description": "Fardo com 400 unidades de tamanho amplo 23x18 cm para legumes picados, cortes especiais e mix de queijos.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "padaria",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "totalplast-bandejas-isopor",
  "sku": "TOT-BAN-B03",
  "priceCents": 5190,
  "weightGrams": 2100,
  "widthMm": 380,
  "heightMm": 500,
  "lengthMm": 380,
  "physicalQuantity": 210,
  "status": "ACTIVE"
},
  {
  "slug": "totalplast-hamburgueira-eps-termica-th01",
  "name": "Hamburgueira Térmica Articulada TH-01 Totalplast",
  "description": "Fardo com 100 embalagens térmicas de isopor com trava click para hambúrguer e lanches quentes.",
  "categorySlugs": [
    "embalagens",
    "caixas-e-bandejas"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "totalplast-bandejas-isopor",
  "sku": "TOT-HAM-TH01",
  "priceCents": 2690,
  "compareAtPriceCents": 3100,
  "weightGrams": 620,
  "widthMm": 150,
  "heightMm": 270,
  "lengthMm": 310,
  "physicalQuantity": 390,
  "status": "ACTIVE"
},
  {
  "slug": "totalplast-prato-termico-eps-refeicao-festa",
  "name": "Prato Térmico EPS 22 cm Fundo Branco Totalplast",
  "description": "Pacote com 50 pratos térmicos em isopor. Não transfere calor para o colo e preserva a comida quente do buffet.",
  "categorySlugs": [
    "descartaveis",
    "pratos"
  ],
  "segmentSlugs": [
    "restaurante-buffet",
    "loja-de-festas"
  ],
  "tagSlugs": [
    "termico",
    "descartavel"
  ],
  "brandSlug": "totalplast-bandejas-isopor",
  "sku": "TOT-PRA-TER-22",
  "priceCents": 1290,
  "weightGrams": 340,
  "widthMm": 220,
  "heightMm": 120,
  "lengthMm": 220,
  "physicalQuantity": 360,
  "status": "ACTIVE"
},
  {
  "slug": "ultra-descartaveis-copo-pp-ultra-transparente-300ml",
  "name": "Copo Ultra PP Super Transparente 300 ml Ultra Descartáveis",
  "description": "Pacote com 100 copos de alta transparência e flexibilidade para sucos de polpa, refrigerantes e água.",
  "categorySlugs": [
    "descartaveis",
    "copos"
  ],
  "segmentSlugs": [
    "lanchonete",
    "bar-distribuidora",
    "loja-de-festas"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "ultra-descartaveis-copos-cristal",
  "sku": "ULT-COP-300-PP",
  "priceCents": 980,
  "compareAtPriceCents": 1190,
  "weightGrams": 550,
  "widthMm": 220,
  "heightMm": 340,
  "lengthMm": 220,
  "physicalQuantity": 440,
  "status": "ACTIVE"
},
  {
  "slug": "ultra-descartaveis-copo-pp-ultra-transparente-400ml",
  "name": "Copo Ultra PP Chopp e Bebidas 400 ml Ultra Descartáveis",
  "description": "Pacote com 50 copos reforçados em PP cristalino. Capacidade ideal para chopp tirado na hora e drinks com gelo.",
  "categorySlugs": [
    "descartaveis",
    "copos"
  ],
  "segmentSlugs": [
    "bar-distribuidora",
    "loja-de-festas",
    "lanchonete"
  ],
  "tagSlugs": [
    "transparente",
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "ultra-descartaveis-copos-cristal",
  "sku": "ULT-COP-400-PP",
  "priceCents": 1190,
  "compareAtPriceCents": 1390,
  "weightGrams": 610,
  "widthMm": 240,
  "heightMm": 350,
  "lengthMm": 240,
  "physicalQuantity": 390,
  "status": "ACTIVE"
},
  {
  "slug": "ultra-descartaveis-copo-pp-ultra-transparente-500ml",
  "name": "Copo Ultra PP Chopp e Açaí 500 ml Ultra Descartáveis",
  "description": "Pacote com 50 copos super resistentes de 500 ml com frisos estruturais. O preferido das açaíterias e festivais.",
  "categorySlugs": [
    "descartaveis",
    "copos"
  ],
  "segmentSlugs": [
    "sorveteria-acai",
    "bar-distribuidora",
    "lanchonete"
  ],
  "tagSlugs": [
    "transparente",
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "ultra-descartaveis-copos-cristal",
  "sku": "ULT-COP-500-PP",
  "priceCents": 1480,
  "compareAtPriceCents": 1720,
  "weightGrams": 760,
  "widthMm": 260,
  "heightMm": 360,
  "lengthMm": 260,
  "physicalQuantity": 420,
  "status": "ACTIVE"
},
  {
  "slug": "ultra-descartaveis-copo-pp-ultra-resistente-700ml",
  "name": "Copo Ultra PP Mega 700 ml Drink & Chopp Ultra Descartáveis",
  "description": "Pacote com 50 copos gigantes reforçados para mega drinks, chopp em dobro e açaí com muitas camadas de acompanhamentos.",
  "categorySlugs": [
    "descartaveis",
    "copos"
  ],
  "segmentSlugs": [
    "bar-distribuidora",
    "sorveteria-acai",
    "loja-de-festas"
  ],
  "tagSlugs": [
    "transparente",
    "reforcado",
    "descartavel"
  ],
  "brandSlug": "ultra-descartaveis-copos-cristal",
  "sku": "ULT-COP-700-PP",
  "priceCents": 2190,
  "compareAtPriceCents": 2590,
  "weightGrams": 980,
  "widthMm": 280,
  "heightMm": 400,
  "lengthMm": 280,
  "physicalQuantity": 280,
  "status": "ACTIVE"
},
  {
  "slug": "ultra-descartaveis-canudo-biodegradavel-embalado-individualmente",
  "name": "Canudo Biodegradável Embalado Individualmente Ultra Descartáveis",
  "description": "Caixa com 500 canudos biodegradáveis embalados um a um em papel para higiene máxima em bares e restaurantes.",
  "categorySlugs": [
    "descartaveis"
  ],
  "segmentSlugs": [
    "lanchonete",
    "bar-distribuidora",
    "sorveteria-acai"
  ],
  "tagSlugs": [
    "biodegradavel",
    "descartavel"
  ],
  "brandSlug": "ultra-descartaveis-copos-cristal",
  "sku": "ULT-CAN-BIO-IND",
  "priceCents": 1690,
  "compareAtPriceCents": 1990,
  "weightGrams": 420,
  "widthMm": 150,
  "heightMm": 220,
  "lengthMm": 220,
  "physicalQuantity": 450,
  "status": "ACTIVE"
},
  {
  "slug": "ultra-descartaveis-copo-bolha-pet-350ml-com-tampa",
  "name": "Copo Bolha PET Cristal 350 ml com Tampa Bolha Ultra Descartáveis",
  "description": "Pacote com 50 conjuntos copo + tampa bolha sem furo em PET ultra transparente brilhante. Ideal para açaí e sobremesas.",
  "categorySlugs": [
    "descartaveis",
    "copos",
    "embalagens"
  ],
  "segmentSlugs": [
    "sorveteria-acai",
    "confeitaria-bolos",
    "delivery"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel",
    "reforcado"
  ],
  "brandSlug": "ultra-descartaveis-potes-bolha",
  "sku": "ULT-BOL-350-PET",
  "priceCents": 3290,
  "compareAtPriceCents": 3800,
  "weightGrams": 950,
  "widthMm": 210,
  "heightMm": 340,
  "lengthMm": 210,
  "physicalQuantity": 360,
  "status": "ACTIVE"
},
  {
  "slug": "ultra-descartaveis-copo-bolha-pet-400ml-com-tampa",
  "name": "Copo Bolha PET Cristal 400 ml com Tampa Bolha Ultra Descartáveis",
  "description": "Pacote com 50 conjuntos. O campeão de vendas para milk-shakes, cafés gelados, açaí e sobremesas com chantilly.",
  "categorySlugs": [
    "descartaveis",
    "copos",
    "embalagens"
  ],
  "segmentSlugs": [
    "sorveteria-acai",
    "confeitaria-bolos",
    "lanchonete"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel",
    "reforcado"
  ],
  "brandSlug": "ultra-descartaveis-potes-bolha",
  "sku": "ULT-BOL-400-PET",
  "priceCents": 3690,
  "compareAtPriceCents": 4200,
  "weightGrams": 1080,
  "widthMm": 220,
  "heightMm": 360,
  "lengthMm": 220,
  "physicalQuantity": 330,
  "status": "ACTIVE"
},
  {
  "slug": "ultra-descartaveis-copo-bolha-pet-500ml-com-berco-divisorio",
  "name": "Copo Bolha 500 ml com Berço Inserção para Granola Ultra Descartáveis",
  "description": "Pacote com 50 kits: copo 500 ml + tampa bolha + berço inserção para separar leite condensado, cereais ou paçoca do açaí.",
  "categorySlugs": [
    "descartaveis",
    "copos",
    "embalagens"
  ],
  "segmentSlugs": [
    "sorveteria-acai",
    "delivery",
    "confeitaria-bolos"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel",
    "reforcado"
  ],
  "brandSlug": "ultra-descartaveis-potes-bolha",
  "sku": "ULT-BOL-500-BER",
  "priceCents": 4790,
  "compareAtPriceCents": 5490,
  "weightGrams": 1350,
  "widthMm": 230,
  "heightMm": 380,
  "lengthMm": 230,
  "physicalQuantity": 280,
  "status": "ACTIVE"
},
  {
  "slug": "ultra-descartaveis-pote-sobremesa-bolha-200ml",
  "name": "Pote Sobremesa PET Bolha 200 ml Ultra Descartáveis",
  "description": "Pacote com 50 potes redondos compactos com tampa bolha alta para mini sobremesas, pudins e pavês de vitrine.",
  "categorySlugs": [
    "embalagens",
    "descartaveis"
  ],
  "segmentSlugs": [
    "confeitaria-bolos",
    "padaria"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "ultra-descartaveis-potes-bolha",
  "sku": "ULT-POT-200-PET",
  "priceCents": 2490,
  "compareAtPriceCents": 2890,
  "weightGrams": 680,
  "widthMm": 180,
  "heightMm": 300,
  "lengthMm": 180,
  "physicalQuantity": 310,
  "status": "ACTIVE"
},
  {
  "slug": "ultra-descartaveis-tampa-bolha-sem-furo-universal",
  "name": "Tampa Bolha sem Furo PET Universal Ultra Descartáveis",
  "description": "Pacote com 100 tampas bolha sem furo compatíveis com copos de diâmetro 92 mm e 98 mm. Altura generosa para coberturas.",
  "categorySlugs": [
    "descartaveis",
    "copos"
  ],
  "segmentSlugs": [
    "sorveteria-acai",
    "confeitaria-bolos"
  ],
  "tagSlugs": [
    "transparente",
    "descartavel"
  ],
  "brandSlug": "ultra-descartaveis-potes-bolha",
  "sku": "ULT-TAM-BOL-SF",
  "priceCents": 1990,
  "weightGrams": 450,
  "widthMm": 190,
  "heightMm": 240,
  "lengthMm": 190,
  "physicalQuantity": 400,
  "status": "ACTIVE"
},
  {
  "slug": "vipel-sacola-kraft-delivery-pequena-alca-torcida",
  "name": "Sacola de Papel Kraft Delivery P com Alça Torcida Vipel",
  "description": "Pacote com 50 sacolas em papel kraft natural 100g com alça torcida colada com reforço interno. Ideal para marmitas e pequenos pedidos.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "delivery",
    "lanchonete",
    "padaria"
  ],
  "tagSlugs": [
    "kraft",
    "biodegradavel",
    "reforcado"
  ],
  "brandSlug": "vipel-sacolas-kraft",
  "sku": "VIP-SAC-KRA-P",
  "priceCents": 3490,
  "compareAtPriceCents": 3990,
  "weightGrams": 1450,
  "widthMm": 220,
  "heightMm": 280,
  "lengthMm": 100,
  "physicalQuantity": 360,
  "status": "ACTIVE"
},
  {
  "slug": "vipel-sacola-kraft-delivery-media-alca-torcida",
  "name": "Sacola de Papel Kraft Delivery M Alça Torcida Vipel",
  "description": "Pacote com 50 sacolas tamanho padrão delivery (28x32x14 cm). Comporta até 2 caixas de comida e refrigerante.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "delivery",
    "restaurante-buffet",
    "lanchonete"
  ],
  "tagSlugs": [
    "kraft",
    "biodegradavel",
    "reforcado"
  ],
  "brandSlug": "vipel-sacolas-kraft",
  "sku": "VIP-SAC-KRA-M",
  "priceCents": 4290,
  "compareAtPriceCents": 4890,
  "weightGrams": 1850,
  "widthMm": 280,
  "heightMm": 320,
  "lengthMm": 140,
  "physicalQuantity": 320,
  "status": "ACTIVE"
},
  {
  "slug": "vipel-sacola-kraft-delivery-grande-alca-plana",
  "name": "Sacola Kraft Delivery G Fundo Largo Alça Plana Vipel",
  "description": "Pacote com 50 sacolas de fundo extra largo para caixas de pizza até 35 cm e embalagens quadradas que não podem tombar.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "delivery",
    "pizzaria",
    "restaurante-buffet"
  ],
  "tagSlugs": [
    "kraft",
    "biodegradavel",
    "reforcado"
  ],
  "brandSlug": "vipel-sacolas-kraft",
  "sku": "VIP-SAC-KRA-G",
  "priceCents": 5490,
  "compareAtPriceCents": 6200,
  "weightGrams": 2300,
  "widthMm": 360,
  "heightMm": 360,
  "lengthMm": 200,
  "physicalQuantity": 270,
  "status": "ACTIVE"
},
  {
  "slug": "vipel-saco-kraft-sos-pipoca-lanche-n2",
  "name": "Saco de Papel Kraft SOS Fundo Reto Nº 2 Vipel",
  "description": "Pacote com 250 sacos de papel kraft natural 60g com fundo retangular rígido para batatas fritas, pães e doces.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "padaria",
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "kraft",
    "biodegradavel",
    "descartavel"
  ],
  "brandSlug": "vipel-sacolas-kraft",
  "sku": "VIP-SOS-N2",
  "priceCents": 2190,
  "compareAtPriceCents": 2550,
  "weightGrams": 1100,
  "widthMm": 150,
  "heightMm": 240,
  "lengthMm": 90,
  "physicalQuantity": 410,
  "status": "ACTIVE"
},
  {
  "slug": "vipel-saco-kraft-sos-hamburguer-artesanal-n4",
  "name": "Saco Kraft SOS para Hambúrguer e Combos Nº 4 Vipel",
  "description": "Pacote com 250 sacos reforçados para delivery sem alça. Ideal para acomodar combo de hambúrguer, fritas e refrigerante lata.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery"
  ],
  "tagSlugs": [
    "kraft",
    "biodegradavel",
    "reforcado"
  ],
  "brandSlug": "vipel-sacolas-kraft",
  "sku": "VIP-SOS-N4",
  "priceCents": 3690,
  "compareAtPriceCents": 4200,
  "weightGrams": 1800,
  "widthMm": 200,
  "heightMm": 320,
  "lengthMm": 120,
  "physicalQuantity": 340,
  "status": "ACTIVE"
},
  {
  "slug": "vipel-saco-de-papel-pipoca-padaria-1kg",
  "name": "Saco de Papel Branco Monolúcido para Pães 1 kg Vipel",
  "description": "Fardo com 500 saquinhos brancos de papel kraft monolúcido virgem para pão francês e quitutes de padaria.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "padaria",
    "confeitaria-bolos"
  ],
  "tagSlugs": [
    "kraft",
    "biodegradavel",
    "descartavel"
  ],
  "brandSlug": "vipel-papel-culinario-bobinas",
  "sku": "VIP-SAC-PAD-1KG",
  "priceCents": 2690,
  "compareAtPriceCents": 3100,
  "weightGrams": 1600,
  "widthMm": 120,
  "heightMm": 280,
  "lengthMm": 60,
  "physicalQuantity": 480,
  "status": "ACTIVE"
},
  {
  "slug": "vipel-saco-de-papel-pipoca-padaria-3kg",
  "name": "Saco de Papel Pão Monolúcido 3 kg Vipel",
  "description": "Fardo com 500 saquinhos de papel para 10 a 15 pães franceses ou pacotes de broas e biscoitos caseiros.",
  "categorySlugs": [
    "sacos-e-sacolas",
    "embalagens"
  ],
  "segmentSlugs": [
    "padaria",
    "confeitaria-bolos"
  ],
  "tagSlugs": [
    "kraft",
    "biodegradavel",
    "descartavel"
  ],
  "brandSlug": "vipel-papel-culinario-bobinas",
  "sku": "VIP-SAC-PAD-3KG",
  "priceCents": 3690,
  "weightGrams": 2400,
  "widthMm": 150,
  "heightMm": 360,
  "lengthMm": 80,
  "physicalQuantity": 390,
  "status": "ACTIVE"
},
  {
  "slug": "vipel-bobina-papel-kraft-puro-60cm-pesado",
  "name": "Bobina de Papel Kraft Natural Puro 60 cm 80g Vipel",
  "description": "Rolo de papel kraft pesado com 150 metros. Indicado para forração de mesas, proteção de produtos e embrulhos de encomendas.",
  "categorySlugs": [
    "embalagens",
    "filme-e-aluminio"
  ],
  "segmentSlugs": [
    "bar-distribuidora",
    "delivery"
  ],
  "tagSlugs": [
    "kraft",
    "biodegradavel",
    "reforcado"
  ],
  "brandSlug": "vipel-papel-culinario-bobinas",
  "sku": "VIP-BOB-KRA-60CM",
  "priceCents": 4990,
  "compareAtPriceCents": 5800,
  "weightGrams": 7200,
  "widthMm": 160,
  "heightMm": 600,
  "lengthMm": 160,
  "physicalQuantity": 150,
  "status": "ACTIVE"
},
  {
  "slug": "vipel-papel-manteiga-culinario-forno-bobina-30m",
  "name": "Bobina de Papel Manteiga Culinário Antiaderente 30 m Vipel",
  "description": "Rolo com 30 metros de papel manteiga profissional com barreira de desmoldagem para assadeiras de doces e bolos.",
  "categorySlugs": [
    "embalagens",
    "filme-e-aluminio"
  ],
  "segmentSlugs": [
    "padaria",
    "confeitaria-bolos",
    "pizzaria"
  ],
  "tagSlugs": [
    "biodegradavel"
  ],
  "brandSlug": "vipel-papel-culinario-bobinas",
  "sku": "VIP-PAP-MAN-30M",
  "priceCents": 1590,
  "weightGrams": 480,
  "widthMm": 60,
  "heightMm": 300,
  "lengthMm": 60,
  "physicalQuantity": 330,
  "status": "ACTIVE"
},
  {
  "slug": "vipel-papel-acoplado-termico-para-lanche-fardo",
  "name": "Papel Acoplado Térmico para Envolver Hambúrguer Vipel",
  "description": "Caixa com 500 folhas de papel acoplado com película plástica interna. Retém a umidade e calor sem vazar molho na embalagem.",
  "categorySlugs": [
    "embalagens",
    "filme-e-aluminio"
  ],
  "segmentSlugs": [
    "lanchonete",
    "delivery",
    "padaria"
  ],
  "tagSlugs": [
    "termico",
    "descartavel",
    "reforcado"
  ],
  "brandSlug": "vipel-papel-culinario-bobinas",
  "sku": "VIP-PAP-ACOP-500",
  "priceCents": 3890,
  "compareAtPriceCents": 4450,
  "weightGrams": 1600,
  "widthMm": 300,
  "heightMm": 380,
  "lengthMm": 70,
  "physicalQuantity": 350,
  "status": "ACTIVE"
},
];
