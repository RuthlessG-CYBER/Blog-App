const fs = require('fs');
let code = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

const savedPostModel = `
model SavedPost {
  id        String   @id @default(uuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@index([userId])
  @@index([postId])
}
`;

// Add SavedPost relation to User
code = code.replace(
  "likes                 Like[]",
  "likes                 Like[]\n  savedPosts            SavedPost[]"
);

// Add SavedPost relation to Post
code = code.replace(
  "likes         Like[]",
  "likes         Like[]\n  savedBy       SavedPost[]"
);

code += savedPostModel;

fs.writeFileSync('backend/prisma/schema.prisma', code);
