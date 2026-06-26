const { PrismaClient } = require('@prisma/client');

// Single shared instance used across the app and tests
// This prevents connection pool exhaustion
const prisma = new PrismaClient();

module.exports = { prisma };
