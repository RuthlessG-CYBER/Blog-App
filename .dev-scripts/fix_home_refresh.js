const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/home.tsx', 'utf8');

// Add depth states
code = code.replace(
  "const [activeTab, setActiveTab] = useState<'Following' | 'Discover' | 'Routine'>('Discover');",
  `const [activeTab, setActiveTab] = useState<'Following' | 'Discover' | 'Routine'>('Discover');
  const [discoverDepth, setDiscoverDepth] = useState(0);
  const [followingDepth, setFollowingDepth] = useState(0);
  const [refreshing, setRefreshing] = useState(false);`
);

// Modify fetchDataForTab to take an optional depth or use current
code = code.replace(
  /const fetchDataForTab = \(tab: string\) => \{[\s\S]*?\};\n/m,
  `const fetchDataForTab = (tab: string, forceDepth?: number) => {
    if (tab === 'Discover') dispatch(fetchDiscoverPosts(forceDepth ?? discoverDepth) as any);
    else if (tab === 'Following') dispatch(fetchFollowingPosts(forceDepth ?? followingDepth) as any);
    else if (tab === 'Routine') dispatch(fetchPosts());
  };\n`
);

// Add pull to refresh handler
code = code.replace(
  "const [isInitialDelay, setIsInitialDelay] = useState(true);",
  `const [isInitialDelay, setIsInitialDelay] = useState(true);
  
  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'Discover') {
      const newDepth = discoverDepth + 1;
      setDiscoverDepth(newDepth);
      await dispatch(fetchDiscoverPosts(newDepth) as any);
    } else if (activeTab === 'Following') {
      const newDepth = followingDepth + 1;
      setFollowingDepth(newDepth);
      await dispatch(fetchFollowingPosts(newDepth) as any);
    } else {
      await dispatch(fetchPosts() as any);
    }
    setRefreshing(false);
  };`
);

// Handle tab press double tap refresh
code = code.replace(
  "fetchDataForTab(activeTab);\n        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });",
  `if (activeTab === 'Discover') {
          setDiscoverDepth(prev => prev + 1);
        } else if (activeTab === 'Following') {
          setFollowingDepth(prev => prev + 1);
        }
        // State updates are async, so we manually calculate the next depth for the fetch call
        fetchDataForTab(activeTab, (activeTab === 'Discover' ? discoverDepth + 1 : (activeTab === 'Following' ? followingDepth + 1 : undefined)));
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });`
);

// Add RefreshControl to FlatList
code = code.replace(
  "showsVerticalScrollIndicator={false}",
  `showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}`
);

fs.writeFileSync('frontend/app/(tabs)/home.tsx', code);
