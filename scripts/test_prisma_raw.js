const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRawUnsafe('SELECT id, status, criticalCount, warningCount, passCount FROM NCERTAuditRun LIMIT 1');
  console.log('Query success:', rows);
}

main().catch(console.error).finally(() => prisma.$disconnect());
