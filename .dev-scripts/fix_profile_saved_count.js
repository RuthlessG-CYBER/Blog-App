const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/profile.tsx', 'utf8');

code = code.replace(
  /Saved\s*<\/Text>/m,
  "Saved ({savedPosts?.length || 0})\n              </Text>"
);

fs.writeFileSync('frontend/app/(tabs)/profile.tsx', code);
