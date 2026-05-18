# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
# Copy frontend package files
COPY frontend/package*.json ./
RUN npm install
# Copy frontend source
COPY frontend/ ./
# Build the frontend
RUN npm run build

# Stage 2: Build the Node.js backend
FROM node:18-alpine
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend/ ./

# Copy built frontend from Stage 1 to /app/frontend/dist
# Our backend server.js uses path.join(__dirname, '../frontend/dist')
# So relative to /app/backend, ../frontend/dist is /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose port (Cloud Run uses PORT environment variable, defaults to 8080 usually)
# Our code uses process.env.PORT || 5001
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
