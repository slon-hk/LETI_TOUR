# Этап 1: Сборка
FROM node:20-alpine AS build
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Используем флаг для решения конфликтов ESLint
RUN npm install --legacy-peer-deps

# Копируем всё остальное
COPY . .

# Собираем проект
RUN npm run build

# Этап 2: Раздача статики через Nginx
FROM nginx:stable-alpine
# В Vite папка сборки называется 'dist'
COPY --from=build /app/dist /usr/share/nginx/html
# Копируем конфиг (убедись, что nginx.conf лежит в этой же папке)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]