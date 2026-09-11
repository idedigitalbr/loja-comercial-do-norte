const baseUrl = process.argv[2] ?? process.env.DEPLOY_URL;
if (!baseUrl) throw new Error('Informe a URL base como argumento ou DEPLOY_URL.');
const checks = [['/', 200], ['/admin', 200], ['/api/v1/health', 200], ['/loja', 200]];
for (const [path, expected] of checks) {
  const response = await fetch(new URL(path, baseUrl));
  if (response.status !== expected) throw new Error(`${path}: expected ${expected}, got ${response.status}`);
  console.log(`${path}: ${response.status}`);
}
console.log('Deployment smoke test passed.');
