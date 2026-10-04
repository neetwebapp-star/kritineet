const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getMindMapForChapter, PHYSICS_MIND_MAPS } = require('../src/lib/mindmaps/physics-mindmap-registry');

async function verify() {
  console.log('Total entries in registry:', PHYSICS_MIND_MAPS.length);
  
  const subjects = await prisma.subject.findMany({
    where: { name: { contains: 'Physics' } },
    include: {
      classLevel: true,
      chapters: {
        orderBy: { chapterNumber: 'asc' },
      },
    },
  });

  let totalTested = 0;
  let matched = 0;
  const missingAssets = [];
  const results = [];

  for (const s of subjects) {
    const classNum = s.classLevel?.name.includes('12') ? 12 : 11;
    console.log(`\n==================================================`);
    console.log(`CLASS ${classNum} PHYSICS CHAPTERS (NCERT 2024-2027)`);
    console.log(`==================================================`);

    for (const c of s.chapters) {
      if (c.chapterNumber > 20) continue; // skip synthetic test chapters
      totalTested++;

      const map = getMindMapForChapter({
        id: c.id,
        slug: c.slug,
        title: c.title,
        chapterNumber: c.chapterNumber,
        classLevel: classNum,
        subjectName: s.name,
      });

      if (map) {
        matched++;
        const fullDiskPath = path.join(__dirname, '..', 'public', map.assetUrl);
        const existsOnDisk = fs.existsSync(fullDiskPath);
        const stats = existsOnDisk ? fs.statSync(fullDiskPath) : null;
        const sizeKB = stats ? Math.round(stats.size / 1024) : 0;

        console.log(`✓ Ch ${c.chapterNumber}: ${c.title}`);
        console.log(`    Mapped To: "${map.title}"`);
        console.log(`    File: "${map.originalFileName}"`);
        console.log(`    Disk Verified: ${existsOnDisk ? 'YES' : 'NO'} (${sizeKB} KB, ${map.dimensions.width}x${map.dimensions.height})`);
        console.log(`    Download Name: ${map.downloadFileName}`);

        results.push({
          class: classNum,
          chNum: c.chapterNumber,
          title: c.title,
          mappedFile: map.originalFileName,
          exists: existsOnDisk,
          sizeKB,
        });
      } else {
        missingAssets.push(`Class ${classNum} Ch ${c.chapterNumber}: ${c.title}`);
        console.log(`✗ Ch ${c.chapterNumber}: ${c.title} -> [ASSET NOT IN 28 MIND MAPS]`);
      }
    }
  }

  console.log(`\n==================================================`);
  console.log(`TOTAL STATS:`);
  console.log(`Connected Chapters: ${matched} / ${totalTested}`);
  console.log(`Missing Mind Maps: ${missingAssets.length} (${missingAssets.join(', ')})`);
  console.log(`==================================================`);

  await prisma.$disconnect();
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
