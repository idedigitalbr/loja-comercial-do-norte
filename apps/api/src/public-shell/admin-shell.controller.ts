import { Controller, Get, Res } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Response } from 'express';
import { resolveApiProjectRoot } from '../modules/files/storage-root';

async function readAdminShell() {
  const apiRoot = resolveApiProjectRoot();
  try {
    return await readFile(join(apiRoot, 'public/admin/index.html'), 'utf8');
  } catch {
    return readFile(join(apiRoot, '../admin/index.html'), 'utf8');
  }
}

@Controller('admin')
export class AdminShellController {
  @Get('')
  async root(@Res() response: Response) {
    response.type('html').send(await readAdminShell());
  }

  @Get('*path')
  async fallback(@Res() response: Response) {
    response.type('html').send(await readAdminShell());
  }
}
