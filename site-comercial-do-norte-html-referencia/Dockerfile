# Imagem base oficial do Nginx Alpine ultraleve (~25MB)
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copia a configuração personalizada de alta performance
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos do projeto
COPY index.html /usr/share/nginx/html/
COPY design-system-preview.html /usr/share/nginx/html/
COPY robots.txt /usr/share/nginx/html/
COPY sitemap.xml /usr/share/nginx/html/
COPY favicon.ico /usr/share/nginx/html/
COPY favicon.png /usr/share/nginx/html/
COPY favicon-192.png /usr/share/nginx/html/
COPY apple-touch-icon.png /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

# Expõe a porta HTTP padrão do container
EXPOSE 80

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]
