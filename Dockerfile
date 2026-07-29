FROM nginx:alpine
RUN echo "<h1>¡Desplegado desde GitHub Actions a mi Raspberry Pi!</h1>" > /usr/share/nginx/html/index.html
EXPOSE 80