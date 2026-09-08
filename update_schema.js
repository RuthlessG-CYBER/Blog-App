const fs = require('fs');
const schemaPath = './backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

if (!schema.includes('model Comment')) {
  schema += `
model Comment {
  id        String   @id @default(uuid())
  userId    String
  postId    String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([userId])
}
`;
}

if (!schema.includes('model Follow')) {
  schema += `
model Follow {
  id          String   @id @default(uuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("Following", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("Followers", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}
`;
}

// Add comments and follows relations to User
if (!schema.includes('comments              Comment[]')) {
  schema = schema.replace('  posts                 Post[]', '  posts                 Post[]\n  comments              Comment[]\n  followers             Follow[] @relation("Followers")\n  following             Follow[] @relation("Following")');
}

// Add comments relation to Post
if (!schema.includes('comments      Comment[]')) {
  schema = schema.replace('  likes         Like[]', '  likes         Like[]\n  comments      Comment[]');
}

fs.writeFileSync(schemaPath, schema);
