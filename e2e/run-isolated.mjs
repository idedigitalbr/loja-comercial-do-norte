import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname,join } from 'node:path';
const require=createRequire(import.meta.url);
const cli=join(dirname(require.resolve('@playwright/test/package.json')),'cli.js');
const result=spawnSync(process.execPath,[cli,'test',...process.argv.slice(2)],{env:{...process.env,E2E_MODE:'isolated'},stdio:'inherit',windowsHide:true});
if(result.error)throw result.error;
process.exitCode=result.status??1;
