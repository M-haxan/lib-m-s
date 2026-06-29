FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source code
COPY . .

# Set environment variables
ENV PORT=7860
ENV NODE_ENV=production

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Run the app
CMD ["node", "index.js"]
