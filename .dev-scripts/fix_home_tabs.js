const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/home.tsx', 'utf8');

// 1. Add state for active tab and import fetchFollowingPosts
code = code.replace(
  "import { fetchDiscoverPosts, toggleLikePost, updateFollowState } from '../../src/store/slices/postSlice';",
  "import { fetchPosts, fetchDiscoverPosts, fetchFollowingPosts, toggleLikePost, updateFollowState } from '../../src/store/slices/postSlice';"
);

code = code.replace(
  "const lastTabPress = useRef(0);",
  "const lastTabPress = useRef(0);\n  const [activeTab, setActiveTab] = useState<'Following' | 'Discover' | 'Routine'>('Discover');"
);

// 2. Add loading effect when tab changes
code = code.replace(
  "dispatch(fetchDiscoverPosts());\n      setIsInitialDelay(false);",
  "fetchDataForTab('Discover');\n      setIsInitialDelay(false);"
);

code = code.replace(
  "const [isInitialDelay, setIsInitialDelay] = useState(true);",
  `const [isInitialDelay, setIsInitialDelay] = useState(true);
  
  const fetchDataForTab = (tab: string) => {
    if (tab === 'Discover') dispatch(fetchDiscoverPosts());
    else if (tab === 'Following') dispatch(fetchFollowingPosts());
    else if (tab === 'Routine') dispatch(fetchPosts());
  };

  useEffect(() => {
    if (!isInitialDelay) {
      fetchDataForTab(activeTab);
    }
  }, [activeTab]);`
);

// 3. Update data source for FlatList
code = code.replace(
  "const { discoverPosts, loading } = useAppSelector((state) => state.posts);",
  "const { posts, discoverPosts, followingPosts, loading } = useAppSelector((state) => state.posts);"
);

code = code.replace(
  "data={showSkeleton ? [1, 2, 3] : discoverPosts}",
  "data={showSkeleton ? [1, 2, 3] : (activeTab === 'Discover' ? discoverPosts : (activeTab === 'Following' ? followingPosts : posts))}"
);

// 4. Update Header UI to handle active state
const newHeader = `  const renderHeader = () => (
    <View className="pt-space-md pb-space-sm">
      <View className="px-margin-mobile flex-row items-center justify-between mb-space-sm">
        <Text className="text-xs uppercase tracking-wider text-secondary font-semibold">Chronicle Stream</Text>
      </View>
      
      <View className="px-margin-mobile flex-row items-center gap-space-xs mb-space-sm pb-1 overflow-visible">
        <TouchableOpacity 
          onPress={() => setActiveTab('Following')}
          className={\`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full \${activeTab === 'Following' ? 'bg-primary shadow-sm' : 'bg-surface-container-low'}\`}
        >
          {activeTab === 'Following' && <View className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />}
          <Text className={\`font-medium text-sm \${activeTab === 'Following' ? 'text-on-primary' : 'text-secondary'}\`}>Following</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('Discover')}
          className={\`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full \${activeTab === 'Discover' ? 'bg-primary shadow-sm' : 'bg-surface-container-low'}\`}
        >
          {activeTab === 'Discover' && <View className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />}
          <Text className={\`font-medium text-sm \${activeTab === 'Discover' ? 'text-on-primary' : 'text-secondary'}\`}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('Routine')}
          className={\`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full \${activeTab === 'Routine' ? 'bg-primary shadow-sm' : 'bg-surface-container-low'}\`}
        >
          {activeTab === 'Routine' && <View className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />}
          <Text className={\`font-medium text-sm \${activeTab === 'Routine' ? 'text-on-primary' : 'text-secondary'}\`}>Routine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );`;

code = code.replace(/const renderHeader = \(\) => \([\s\S]*?<\/View>\s*\n\s*\);\n/m, newHeader + '\n');

fs.writeFileSync('frontend/app/(tabs)/home.tsx', code);
