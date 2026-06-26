FROM node:22-alpine

# Upgrade all Alpine packages to latest security patches
# Prevents Trivy from flagging fixable OS-level CVEs
RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./

# Install all deps (prisma CLI needed for generate, it's a devDependency)
RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

# Remove devDependencies (jest, supertest, prisma CLI, picomatch, etc.)
# Production image should only contain what the app needs to run
RUN npm prune --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

