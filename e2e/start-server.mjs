import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isolated, storefrontUrl, adminUrl, fixtureApiUrl } from './environment.mjs';
if (!isolated) throw new Error('Fixture servers require E2E_MODE=isolated');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kind=process.argv[2];
if (kind==='api') { await import('./fixture-api.mjs'); }
else {
 const folder=kind==='storefront'?'apps/storefront':kind==='admin'?'apps/admin':null;
 if (!folder) throw new Error('Unknown fixture server');
 const require=createRequire(join(root,folder,'package.json'));
 const executable=kind==='storefront'?require.resolve('next/dist/bin/next'):join(dirname(require.resolve('vite/package.json')),'bin/vite.js');
 const port=new URL(kind==='storefront'?storefrontUrl:adminUrl).port;
 const args=kind==='storefront'?['dev','--hostname','127.0.0.1','--port',port]:['--host','127.0.0.1','--port',port,'--strictPort'];
 const environment={...process.env,NODE_ENV:'development',VERCEL:'',VERCEL_ENV:'',API_URL:fixtureApiUrl,NEXT_PUBLIC_API_URL:fixtureApiUrl,NEXT_PUBLIC_SITE_URL:storefrontUrl,VITE_API_PROXY_TARGET:fixtureApiUrl,VITE_STOREFRONT_URL:storefrontUrl,DATABASE_URL:'',DATABASE_URL_UNPOOLED:'',POSTGRES_URL:''};
 const child=spawn(process.execPath,[executable,...args],{cwd:join(root,folder),env:environment,stdio:'inherit',windowsHide:true});
 for(const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>child.kill(signal));
 child.on('exit',code=>{process.exitCode=code??1;});
}
