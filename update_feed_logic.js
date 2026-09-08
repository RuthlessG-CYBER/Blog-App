const fs = require('fs');
let code = fs.readFileSync('backend/src/services/post.service.ts', 'utf8');

// Replace getDiscoverPosts raw query logic
code = code.replace(
  /const rawPostIds = await prisma\.\$queryRaw<any\[\]>`[\s\S]*?OFFSET \$\{skip\}\n\s*`;/m,
  `let rawPostIds;
  if (depth === 0) {
    rawPostIds = await prisma.$queryRaw<any[]>\`
      WITH RankedPosts AS (
        SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) as rn
        FROM "Post"
        WHERE "userId" != \${userId}
      )
      SELECT id FROM RankedPosts
      WHERE rn = 1
      ORDER BY "createdAt" DESC
      LIMIT \${take} OFFSET \${skip}
    \`;
  } else {
    rawPostIds = await prisma.$queryRaw<any[]>\`
      WITH RankedPosts AS (
        SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY RANDOM()) as rn
        FROM "Post"
        WHERE "userId" != \${userId}
      )
      SELECT id FROM RankedPosts
      WHERE rn = 1
      ORDER BY "createdAt" DESC
      LIMIT \${take} OFFSET \${skip}
    \`;
  }`
);

// Replace getFollowingPosts raw query logic
code = code.replace(
  /const rawPostIds = await prisma\.\$queryRaw<any\[\]>`[\s\S]*?OFFSET \$\{skip\}\n\s*`;/m,
  `let rawPostIds;
  if (depth === 0) {
    rawPostIds = await prisma.$queryRaw<any[]>\`
      WITH RankedPosts AS (
        SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) as rn
        FROM "Post"
        WHERE "userId" = ANY(ARRAY[\${Prisma.join(followingIds)}]::uuid[])
      )
      SELECT id FROM RankedPosts
      WHERE rn = 1
      ORDER BY "createdAt" DESC
      LIMIT \${take} OFFSET \${skip}
    \`;
  } else {
    rawPostIds = await prisma.$queryRaw<any[]>\`
      WITH RankedPosts AS (
        SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY RANDOM()) as rn
        FROM "Post"
        WHERE "userId" = ANY(ARRAY[\${Prisma.join(followingIds)}]::uuid[])
      )
      SELECT id FROM RankedPosts
      WHERE rn = 1
      ORDER BY "createdAt" DESC
      LIMIT \${take} OFFSET \${skip}
    \`;
  }`
);

// Update count logic because rn is always 1 now
code = code.replace(/SELECT CAST\(COUNT\(\*\) AS INTEGER\) as count FROM RankedPosts WHERE rn = \$\{rn\}/g, 'SELECT CAST(COUNT(*) AS INTEGER) as count FROM RankedPosts WHERE rn = 1');

// Remove the const rn = Number(depth) + 1; since we don't need it anymore for rn
code = code.replace(/const rn = Number\(depth\) \+ 1;\n/g, '');


fs.writeFileSync('backend/src/services/post.service.ts', code);
