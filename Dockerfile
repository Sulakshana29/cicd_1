FROM node:22-alpine

# Upgrade all Alpine packages to latest security patches
# Prevents Trivy from flagging fixable OS-level CVEs
RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

