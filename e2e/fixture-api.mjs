import http from 'node:http';
import { isLoopback } from './environment.mjs';
const category={id:'fixture-category',publicId:'fixture-category',name:'Embalagens de Teste',slug:'embalagens-teste',parentId:null,imagePath:null,sortOrder:1};
const product={id:'fixture-product',publicId:'fixture-product',name:'Caixa de Pizza Fixture',slug:'caixa-pizza-35cm',description:'Produto fictício exclusivo do ambiente isolado de teste.',status:'ACTIVE',brand:null,categories:[{category}],images:[],variants:[{id:'fixture-variant',publicId:'fixture-variant',sku:'FIXTURE-PIZZA',priceCents:1200,compareAtPriceCents:null,status:'ACTIVE',stockStatus:'IN_STOCK',weightGrams:100,widthMm:350,heightMm:30,lengthMm:350}]};
const user={id:'fixture-admin',publicId:'fixture-admin',email:'admin@isolated.test',roles:['ADMIN'],permissions:['settings.manage','products.write','quotes.manage','orders.update','inventory.adjust','reports.financial']};
const quotes=new Map();
const server=http.createServer(async(req,res)=>{
 const origin=req.headers.origin;
 if(origin && isLoopback(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Access-Control-Allow-Credentials','true');res.setHeader('Access-Control-Allow-Headers','content-type,authorization');res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,OPTIONS');}
 res.setHeader('content-type','application/json');
 if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
 const url=new URL(req.url,'http://127.0.0.1:3189');
 const path=url.pathname.replace('/api/v1','');
 const send=(value,status=200)=>{res.writeHead(status);res.end(JSON.stringify(value));};
 if(path==='/health')return send({status:'ok',fixture:true});
 if(path==='/site/config')return send({site:{siteName:'Comercial do Norte',logoPath:null,faviconPath:null,address:null,phone:null,whatsapp:null,instagramUrl:null,title:null,description:null},banners:[],features:{checkout:false,payments:false,trainings:false}});
 if(path==='/site/composition')return send({data:null});
 if(path==='/catalog/products/search'){
  const search=(url.searchParams.get('search')??'').toLowerCase();
  const items=product.name.toLowerCase().includes(search)?[product]:[];
  return send({items,total:items.length,page:1,pageSize:12,totalPages:1,sort:'newest'});
 }
 if(path==='/catalog/products'||path==='/catalog/offers')return send([product]);
 if(path==='/catalog/products/caixa-pizza-35cm')return send(product);
 if(path.startsWith('/catalog/products/'))return send({code:'NOT_FOUND'},404);
 if(path==='/catalog/categories')return send([category]);
 if(path==='/catalog/brands')return send([]);
 if(path==='/auth/check-email')return send({exists:true});
 if(path==='/auth/login'){
  let data='';for await(const chunk of req)data+=chunk;
  const body=JSON.parse(data||'{}');
  if(body.email!=='admin@isolated.test'||body.password!=='IsolatedTest!2026')return send({code:'INVALID_CREDENTIALS'},401);
  res.setHeader('set-cookie','fixture_session=admin; Path=/; HttpOnly; SameSite=Lax');return send({user},201);
 }
 if(path==='/auth/logout'){res.setHeader('set-cookie','fixture_session=; Path=/; Max-Age=0; HttpOnly');return send({ok:true});}
 const authenticated=(req.headers.cookie??'').includes('fixture_session=admin');
 if(path==='/auth/me')return authenticated?send({user}):send({code:'AUTHENTICATION_REQUIRED'},401);
 if(path.startsWith('/admin/')){
  if(!authenticated)return send({code:'AUTHENTICATION_REQUIRED'},401);
  if(path==='/admin/quotes')return send({items:[],counts:{REQUESTED:0},total:0,page:1,pageSize:20});
  return send([]);
 }
 if(path==='/quotes'&&req.method==='POST'){
  let text='';for await(const chunk of req)text+=chunk;
  const input=JSON.parse(text||'{}');
  const quote={publicId:'fixture-quote-confirmed',status:'REQUESTED',customerName:input.customerName,customerPhone:'*******7777',companyName:input.companyName??null,itemsCount:1,subtotalCents:1200,notes:input.notes??null,createdAt:new Date().toISOString(),answeredAt:null,items:[{productName:product.name,productSlug:product.slug,sku:'FIXTURE-PIZZA',imagePath:null,quantity:1,unitPriceCents:1200,totalCents:1200}]};
  quotes.set(quote.publicId,quote);return send(quote,201);
 }
 if(path.startsWith('/quotes/'))return quotes.has(path.slice(8))?send(quotes.get(path.slice(8))):send({code:'NOT_FOUND'},404);
 send({code:'FIXTURE_ENDPOINT_NOT_IMPLEMENTED'},404);
});
server.listen(3189,'127.0.0.1');
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
