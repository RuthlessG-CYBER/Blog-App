const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/profile.tsx', 'utf8');

code = code.replace(
  "const { posts, loading } = useAppSelector((state) => state.posts);",
  "const { posts, savedPosts, loading } = useAppSelector((state) => state.posts);\n  const [activeTab, setActiveTab] = useState<'Stories' | 'Saved'>('Stories');"
);

code = code.replace(/userPosts/g, "posts");

fs.writeFileSync('frontend/app/(tabs)/profile.tsx', code);
