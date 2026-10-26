import { Controller, Get, Next, Req, Res } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import { resolveApiProjectRoot } from '../modules/files/storage-root';

async function readAdminShell() {
  const apiRoot = resolveApiProjectRoot();
  const candidates = [
    join(apiRoot, 'public/admin/index.html'),
    join(process.cwd(), 'public/admin/index.html'),
    join(process.cwd(), 'apps/api/public/admin/index.html'),
    join(__dirname, '../../../public/admin/index.html'),
    join(__dirname, '../../public/admin/index.html'),
    join(__dirname, '../public/admin/index.html'),
  ];
  for (const candidate of candidates) {
    try {
      return await readFile(candidate, 'utf8');
    } catch {
      // continue
    }
  }
  return '<!DOCTYPE html><html><head><title>Admin</title></head><body><div id="root">Painel Administrativo</div></body></html>';
}

@Controller('admin')
export class AdminShellController {
  @Get('')
  async root(@Res() response: Response) {
    response.type('html').send(await readAdminShell());
  }

  @Get('*')
  async fallback(
    @Req() req: Request,
    @Res() response: Response,
    @Next() next: NextFunction,
  ) {
    const rawUrl = req.originalUrl || req.url || req.path;
    const cleanPath = rawUrl.split('?')[0].replace(/^\/?(admin\/?)?/, '');
    if (cleanPath.startsWith('assets/') || cleanPath.includes('.')) {
      const candidates = [
        join(resolveApiProjectRoot(), 'public/admin', cleanPath),
        join(process.cwd(), 'public/admin', cleanPath),
        join(process.cwd(), 'apps/api/public/admin', cleanPath),
        join(__dirname, 'public/admin', cleanPath),
        join(__dirname, '../public/admin', cleanPath),
        join(__dirname, '../../public/admin', cleanPath),
        join(__dirname, '../../../public/admin', cleanPath),
        join(__dirname, '../../../../public/admin', cleanPath),
      ];
      for (const candidate of candidates) {
        if (existsSync(candidate)) {
          return response.sendFile(candidate);
        }
      }
      return next();
    }
    response.type('html').send(await readAdminShell());
  }
}

