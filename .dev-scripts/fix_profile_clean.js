const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/profile.tsx', 'utf8');

// fix imports
code = code.replace("import React, { useEffect } from \"react\";", "import React, { useEffect, useState } from \"react\";");

// fix state selection
code = code.replace(
  "const { posts, savedPosts, loading } = useAppSelector((state) => state.posts);\n  const [activeTab, setActiveTab] = useState<'Stories' | 'Saved'>('Stories');",
  "const { posts: allPosts, savedPosts, loading } = useAppSelector((state) => state.posts);\n  const [activeTab, setActiveTab] = useState<'Stories' | 'Saved'>('Stories');"
);

// fix filter
code = code.replace(
  "const posts = posts.filter((post: any) => post.userId === user?.id);",
  "const userPosts = allPosts.filter((post: any) => post.userId === user?.id);"
);

// fix variable name in rendering
code = code.replace(/\(activeTab === 'Stories' \? posts : savedPosts\)/g, "(activeTab === 'Stories' ? userPosts : savedPosts)");

fs.writeFileSync('frontend/app/(tabs)/profile.tsx', code);
