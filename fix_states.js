const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/home.tsx', 'utf8');

code = code.replace(
  /const lastTabPress = useRef\(0\);\n  const \[activeTab, setActiveTab\] = useState<\n    "Discover" \| "Following" \| "Routine"\n  >\("Discover"\);/m,
  `const lastTabPress = useRef(0);
  const [activeTab, setActiveTab] = useState<"Discover" | "Following" | "Routine">("Discover");
  const [discoverDepth, setDiscoverDepth] = useState(0);
  const [followingDepth, setFollowingDepth] = useState(0);
  const [refreshing, setRefreshing] = useState(false);`
);

fs.writeFileSync('frontend/app/(tabs)/home.tsx', code);
