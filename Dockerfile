FROM node:18-bullseye AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ⚠️ Usa o Vite diretamente com a flag experimental
RUN node --experimental-global-webcrypto node_modules/vite/bin/vite.js build

FROM nginx:stable-alpine

RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

