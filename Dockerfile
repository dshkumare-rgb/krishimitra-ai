# Stage 1: Build the Vite Client
FROM node:18-alpine AS client-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Bundle Express Gateway Server
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN npm install --prefix backend
COPY backend/ ./backend/
COPY --from=client-builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "backend/server.js"]
