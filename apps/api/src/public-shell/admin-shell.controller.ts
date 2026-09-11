import { Controller, Get, Res } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import type { Response } from 'express';

async function readAdminShell() {
  try {
    return await readFile('apps/api/public/admin/index.html', 'utf8');
  } catch {
    return readFile('apps/admin/index.html', 'utf8');
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
