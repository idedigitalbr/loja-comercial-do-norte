import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const probe=(environment)=>spawnSync(process.execPath,['--input-type=module','-e',"await import('./e2e/environment.mjs')"],{env:{...process.env,...environment},encoding:'utf8',windowsHide:true});
test('isolated mode rejects public storefront before opening a browser',()=>{
 assert.notEqual(probe({E2E_MODE:'isolated',STOREFRONT_URL:'https://loja-comercialdonorte.vercel.app',ADMIN_URL:'http://127.0.0.1:5179'}).status,0);
});
test('isolated mode rejects a remote admin and hostname substring attacks',()=>{
 for(const ADMIN_URL of ['https://admin-comercialdonorte.vercel.app','http://localhost.attacker.test'])assert.notEqual(probe({E2E_MODE:'isolated',STOREFRONT_URL:'http://127.0.0.1:3101',ADMIN_URL}).status,0);
});
test('isolated mode accepts actual loopback endpoints',()=>{
 assert.equal(probe({E2E_MODE:'isolated',STOREFRONT_URL:'http://127.0.0.1:3101',ADMIN_URL:'http://127.0.0.1:5179'}).status,0);
});
test('public mode is independent from local fixtures',()=>{
 assert.equal(probe({E2E_MODE:'',STOREFRONT_URL:'https://loja-comercialdonorte.vercel.app'}).status,0);
});
