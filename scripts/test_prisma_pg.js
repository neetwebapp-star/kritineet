const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const qCount = await prisma.question.count();
  const optCount = await prisma.questionOption.count();
  const sampleQuestion = await prisma.question.findFirst({
    include: { options: true, chapter: true, topic: true }
  });
  console.log('PRISMA CLIENT POSTGRESQL VERIFICATION:');
  console.log({ userCount, qCount, optCount });
  console.log('Sample question:', {
    id: sampleQuestion?.id,
    stem: sampleQuestion?.stem?.substring(0, 60),
    chapter: sampleQuestion?.chapter?.title,
    topic: sampleQuestion?.topic?.title,
    optionsCount: sampleQuestion?.options?.length
  });
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Prisma test error:', err);
  process.exit(1);
});
