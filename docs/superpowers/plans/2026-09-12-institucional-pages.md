# Páginas institucionais públicas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar Home, Sobre nós, Serviços e Certificação internacional no storefront, mover o login para `/entrar` e atualizar a navegação pública sem quebrar a loja existente.

**Architecture:** Páginas React focadas em apresentação, com conteúdo institucional centralizado em um módulo tipado de fallback. `StorefrontShell` continuará responsável pelo chrome global; cada página terá seus próprios componentes semânticos e classes `institutional-*`, preparando a futura substituição dos dados estáticos por configurações do admin.

**Tech Stack:** React 19, React Router 7, TypeScript, Vitest, Testing Library, CSS global existente do storefront, Vite.

**Spec:** `docs/superpowers/specs/2026-09-12-institucional-pages-design.md`

## Global Constraints

- Manter o design system preto/branco/dourado e as fontes Work Sans/Inter existentes.
- Não alterar o fluxo de loja, carrinho, checkout, pedidos, produto, categoria ou marca.
- O login do cliente deve continuar usando `/api/v1/auth/login`, mas ficará em `/entrar`.
- Usar somente conteúdo público analisado e não incluir scripts/widgets do WordPress original.
- Todos os links externos de WhatsApp/Instagram devem usar `target="_blank"` e `rel="noreferrer"`.
- Cobrir o comportamento novo com testes antes do código de produção e verificar `test`, `typecheck`, `lint` e `build`.

---

### Task 1: Content contract and route tests

**Files:**
- Create: `apps/storefront/src/pages/institutional-pages.spec.tsx`
- Create: `apps/storefront/src/content/institutional-content.ts`
- Modify: `apps/storefront/src/routes/router.tsx:1-28`

**Interfaces:**
- Produces `institutionalContent` with `site`, `hero`, `services`, `testimonials`, `about`, and `certification` fields consumed by all institutional pages.
- Produces routes `/`, `/entrar`, `/sobre-nos`, `/servicos`, `/certificacao-internacional`.

- [ ] **Step 1: Write the failing route/content tests**

Add tests that render `StorefrontRoutes` in a `MemoryRouter` for each path and assert the semantic contract:

```tsx
it('renders the institutional home at the root route', () => {
  render(<MemoryRouter initialEntries={['/']}><StorefrontRoutes /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Você linda todos os dias' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Conheça nossa loja' })).toHaveAttribute('href', '/loja');
});

it('keeps customer login at /entrar', () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  render(<MemoryRouter initialEntries={['/entrar']}><StorefrontRoutes /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Entrar na conta' })).toBeInTheDocument();
});

it.each([
  ['/sobre-nos', 'Nossa história'],
  ['/servicos', 'Serviços para realçar sua beleza'],
  ['/certificacao-internacional', 'Padrão internacional'],
] as const)('renders %s with its primary heading', (path, heading) => {
  render(<MemoryRouter initialEntries={[path]}><StorefrontRoutes /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
});
```

Also assert the essential public copy and CTA links: the services page exposes `Cabelos & Penteados`, the about page exposes `Missão`, the certification page exposes `Verificar certificação`, and every relevant CTA contains `wa.me/5596981001897`.

- [ ] **Step 2: Run the focused test to verify it fails for the missing pages**

Run: `pnpm --filter storefront test --run src/pages/institutional-pages.spec.tsx`

Expected: FAIL because the new page modules/routes do not exist yet; no assertion should fail due to a test syntax error.

- [ ] **Step 3: Add the typed content source and route skeleton**

Create `institutional-content.ts` with the public address, phone, Instagram, WhatsApp URL, hero copy, service titles/descriptions, mission/vision/values, team entries, certification benefits, and three testimonials. Keep image URLs in one `images` object, including the public hero image and logo fallback. Add page imports and route elements in `router.tsx`; temporarily render the new page components as their final modules so the following tasks can turn the focused test green.

- [ ] **Step 4: Run the focused test again**

Run: `pnpm --filter storefront test --run src/pages/institutional-pages.spec.tsx`

Expected: FAIL only on page headings/components that are not implemented yet, confirming the route contract is wired and the test is exercising the requested behavior.

### Task 2: Public shell navigation and account route

**Files:**
- Modify: `apps/storefront/src/components/storefront-shell.tsx:1-84`
- Modify: `apps/storefront/src/components/storefront-shell.spec.tsx:1-27`
- Modify: `apps/storefront/src/features/account/login-page.tsx:1-66` only if copy/link affordances need route context

**Interfaces:**
- Consumes `institutionalContent.site` for address, phone, Instagram, and WhatsApp.
- Produces header links for `/`, `/sobre-nos`, `/servicos`, `/loja`, `/certificacao-internacional`, and `/entrar`.

- [ ] **Step 1: Extend the shell test before implementation**

Add assertions that the banner includes `Sobre nós`, `Serviços` and `Certificação internacional`, that the header contains a link named `Entrar` pointing to `/entrar`, and that `/sobre-nos` marks the corresponding link active.

- [ ] **Step 2: Run the shell test and confirm the new assertions fail**

Run: `pnpm --filter storefront test --run src/components/storefront-shell.spec.tsx`

Expected: FAIL on the missing institutional links/active state.

- [ ] **Step 3: Implement the navigation update**

Replace the old top-level labels `Início`/`Treinamentos` with the institutional navigation while retaining cart and orders access in the actions/mobile menu. Use a helper such as `isNavigationItemActive(pathname, href)` so `/` is active only at the root and nested public routes do not incorrectly activate multiple entries. Add the account link in the actions and mobile menu. Keep the existing logo asset and footer structure, moving shared copy to `institutionalContent.site`.

- [ ] **Step 4: Run focused shell and existing commerce tests**

Run: `pnpm --filter storefront test --run src/components/storefront-shell.spec.tsx src/pages/commerce-pages.spec.tsx`

Expected: PASS with the new navigation and no regression in account/cart/checkout contracts.

### Task 3: Home page

**Files:**
- Create: `apps/storefront/src/pages/home-page.tsx`
- Modify: `apps/storefront/src/pages/institutional-pages.spec.tsx`
- Modify: `apps/storefront/src/styles.css` by adding a dedicated `institutional-home` section before the media queries

**Interfaces:**
- Consumes `institutionalContent` and shared shell navigation.
- Produces one `main.institutional-page.institutional-home` with hero, about teaser, five service cards, store promotion, booking CTA, testimonials, and local page navigation links.

- [ ] **Step 1: Add Home-specific failing assertions**

Assert the presence of sections named `Sobre Jonas & Elivaldo`, `Nossos serviços`, `Conheça nossa loja de produtos`, and `Depoimentos`; assert that the hero exposes an accessible image and a `Ver o vídeo` CTA; assert at least one link to `/servicos` and one WhatsApp CTA.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm --filter storefront test --run src/pages/institutional-pages.spec.tsx`

Expected: FAIL because `HomePage` does not yet render those sections.

- [ ] **Step 3: Implement the Home markup**

Build the page with semantic `section` elements, one `h1`, image `alt` text, `Link` components for internal navigation, and external WhatsApp/video links. Use the extracted public copy without copying WordPress DOM or third-party widgets. Use the content image constants as initial fallback; if an image fails, the CSS background/placeholder remains readable.

- [ ] **Step 4: Implement responsive Home styles**

Add full-bleed hero overlay, two-column about section, five-card service grid, cream/gold store banner, alternating booking blocks, testimonial grid and responsive breakpoints at 820px/560px consistent with existing tokens. Keep buttons square except the existing WhatsApp pill.

- [ ] **Step 5: Run the Home-focused test**

Run: `pnpm --filter storefront test --run src/pages/institutional-pages.spec.tsx`

Expected: PASS for all Home assertions and remaining institutional route failures only.

### Task 4: About page

**Files:**
- Create: `apps/storefront/src/pages/about-page.tsx`
- Modify: `apps/storefront/src/pages/institutional-pages.spec.tsx`
- Modify: `apps/storefront/src/styles.css` with `institutional-about` styles

**Interfaces:**
- Consumes `institutionalContent.about`.
- Produces one `main.institutional-page.institutional-about` with history, mission/vision/values, team and WhatsApp CTA.

- [ ] **Step 1: Add failing About assertions**

Assert headings `Nossa história`, `Missão`, `Visão`, `Valores` and the public leaders `Jonas Moreira` and `Elivaldo Lima`.

- [ ] **Step 2: Run the focused test and confirm the expected failure**

Run: `pnpm --filter storefront test --run src/pages/institutional-pages.spec.tsx`

Expected: FAIL on the missing About page contract.

- [ ] **Step 3: Implement About markup and styles**

Create an editorial page heading, chronological story blocks, a three-card principles grid and a team roster using the existing image fallback or initials when no team asset is available. Keep the long bios concise in the initial view and expose the complete content in accessible text.

- [ ] **Step 4: Run the focused test**

Run: `pnpm --filter storefront test --run src/pages/institutional-pages.spec.tsx`

Expected: PASS for About assertions.

### Task 5: Services page

**Files:**
- Create: `apps/storefront/src/pages/services-page.tsx`
- Modify: `apps/storefront/src/pages/institutional-pages.spec.tsx`
- Modify: `apps/storefront/src/styles.css` with `institutional-services` styles

**Interfaces:**
- Consumes `institutionalContent.services`.
- Produces one `main.institutional-page.institutional-services` with service cards, service categories and booking CTA.

- [ ] **Step 1: Add failing Services assertions**

Assert all five service names, a link to `/loja`, and a WhatsApp CTA.

- [ ] **Step 2: Run the focused test and confirm the expected failure**

Run: `pnpm --filter storefront test --run src/pages/institutional-pages.spec.tsx`

Expected: FAIL on the missing Services page contract.

- [ ] **Step 3: Implement Services markup and styles**

Render service cards with numbered labels, concise descriptions based on the public pages, a “como funciona” strip (avaliação, protocolo, finalização) and a high-contrast appointment panel. Internal links must use React Router; the CTA must use the centralized WhatsApp URL.

- [ ] **Step 4: Run the focused test**

Run: `pnpm --filter storefront test --run src/pages/institutional-pages.spec.tsx`

Expected: PASS for Services assertions.

### Task 6: International certification page

**Files:**
- Create: `apps/storefront/src/pages/certification-page.tsx`
- Modify: `apps/storefront/src/pages/institutional-pages.spec.tsx`
- Modify: `apps/storefront/src/styles.css` with `institutional-certification` styles

**Interfaces:**
- Consumes `institutionalContent.certification`.
- Produces one `main.institutional-page.institutional-certification` with certification statement, validation link, benefits, safety commitments and WhatsApp CTA.

- [ ] **Step 1: Add failing Certification assertions**

Assert the `Padrão internacional` heading, `Verificar certificação` external link, all four benefits, and the contact CTA.

- [ ] **Step 2: Run the focused test and confirm the expected failure**

Run: `pnpm --filter storefront test --run src/pages/institutional-pages.spec.tsx`

Expected: FAIL on the missing Certification page contract.

- [ ] **Step 3: Implement Certification markup and styles**

Create a dark credential hero, a four-item benefit grid, a safety/quality checklist and a final CTA. Set the external validation link to `https://cnbs.com.br/produto/elivaldo-lima-barreto/`, the public verification destination found during source analysis, without inventing a certificate number.

- [ ] **Step 4: Run the focused test**

Run: `pnpm --filter storefront test --run src/pages/institutional-pages.spec.tsx`

Expected: PASS for all four route/page contracts.

### Task 7: Full verification and review handoff

**Files:**
- Modify: `apps/storefront/src/pages/institutional-pages.spec.tsx` only if a verified accessibility or responsive regression needs a test
- Modify: `docs/superpowers/plans/2026-09-12-institucional-pages.md` to check completed steps

**Interfaces:**
- No new runtime interfaces; validates all public routes and existing commerce behavior.

- [ ] **Step 1: Run storefront tests**

Run: `pnpm --filter storefront test`

Expected: exit code 0, all storefront tests passing.

- [ ] **Step 2: Run typecheck, lint and build**

Run: `pnpm --filter storefront typecheck`; `pnpm --filter storefront lint`; `pnpm --filter storefront build`

Expected: each command exits 0 with no TypeScript errors, lint errors or build errors.

- [ ] **Step 3: Smoke-test all public routes**

With the storefront dev server on port 5173, request `/`, `/entrar`, `/sobre-nos`, `/servicos` and `/certificacao-internacional` and confirm HTTP 200. In the browser, verify desktop and a 320px-equivalent viewport for horizontal overflow, navigation, hero CTA, store link and WhatsApp CTA.

- [ ] **Step 4: Review the diff without touching unrelated work**

Run: `git diff -- apps/storefront docs/superpowers/specs docs/superpowers/plans/2026-09-12-institucional-pages.md` and `git status --short`.

Expected: only the institutional page files, their tests, shared shell/styles, spec and plan are part of this delivery; pre-existing unrelated modifications remain untouched.
