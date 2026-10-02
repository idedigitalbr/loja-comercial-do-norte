import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import type { Request, Response } from 'express';
import { join } from 'node:path';
import { CatalogService } from '../modules/catalog/catalog.service';
import { resolveApiProjectRoot } from '../modules/files/storage-root';
import { SeoRendererService } from './seo-renderer.service';

async function readShell() {
  const apiRoot = resolveApiProjectRoot();
  try {
    return await readFile(join(apiRoot, 'public/storefront/index.html'), 'utf8');
  } catch {
    return readFile(join(apiRoot, '../storefront/index.html'), 'utf8');
  }
}

@Controller()
export class StorefrontShellController {
  constructor(private readonly catalog: CatalogService, private readonly seo: SeoRendererService) {}

  @Get('produto/:slug')
  async product(@Param('slug') slug: string, @Res() response: Response) {
    const product = await this.catalog.getProductBySlug(slug);
    const variant = product.variants[0];
    const image = product.images.find((item) => item.isPrimary)?.path;
    response.type('html').send(this.seo.productShell({ name: product.name, slug: product.slug, description: product.description, priceCents: variant?.priceCents ?? 0, image }, await readShell()));
  }

  @Get('')
  async root(@Res() response: Response) {
    response.type('html').send(this.seo.storefrontShell(await readShell()));
  }

  @Get('*path')
  async fallback(@Req() request: Request & { requestId?: string }, @Res() response: Response) {
    if (request.path.startsWith('/api/v1')) {
      response.status(404).json({ code: 'HTTP_ERROR', message: 'Não foi possível concluir a solicitação.', requestId: request.requestId });
      return;
    }
    response.type('html').send(this.seo.storefrontShell(await readShell()));
  }
}
