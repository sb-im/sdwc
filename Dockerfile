FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build; \
  cp -r assets dist/; \
  mv dist/assets/robots.txt dist/; \
  mv dist/assets/favicon.ico dist/; \
  cp src/config.json dist

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
