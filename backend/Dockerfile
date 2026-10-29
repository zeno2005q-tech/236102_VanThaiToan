# Stage 1: Build Frontend React
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Chạy Backend Node.js
FROM node:18-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Copy thư mục frontend build sang backend
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

EXPOSE 5000
CMD ["node", "server.js"]