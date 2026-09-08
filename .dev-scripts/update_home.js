const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/home.tsx', 'utf8');

// Replace chat bubble hardcoded '3' with item.commentsCount
code = code.replace(/<Text className="text-xs text-secondary">3<\/Text>/g, '<Text className="text-xs text-secondary">{item.commentsCount || 0}</Text>');

// Make chat bubble touchable to navigate to comments screen
code = code.replace(
  /<View className="flex-row items-center gap-1.5">\s*<Ionicons name="chatbubble-outline" size=\{16\} color=\{theme.outline\} \/>\s*<Text className="text-xs text-secondary">\{item\.commentsCount \|\| 0\}<\/Text>\s*<\/View>/,
  `<TouchableOpacity className="flex-row items-center gap-1.5" onPress={() => router.push(\`/comments?postId=\${item.id}\` as any)}>
              <Ionicons name="chatbubble-outline" size={16} color={theme.outline} />
              <Text className="text-xs text-secondary">{item.commentsCount || 0}</Text>
            </TouchableOpacity>`
);

// Add follow action logic
code = code.replace(
  "import { fetchDiscoverPosts, toggleLikePost } from '../../src/store/slices/postSlice';",
  "import { fetchDiscoverPosts, toggleLikePost } from '../../src/store/slices/postSlice';\nimport { toggleFollow } from '../../src/api';\nimport Toast from 'react-native-toast-message';"
);

// We need to inject handleFollow function inside HomeScreen
code = code.replace(
  "const flatListRef = useRef<FlatList>(null);",
  `const flatListRef = useRef<FlatList>(null);

  const handleFollow = async (targetUserId: string) => {
    try {
      await toggleFollow(targetUserId);
      dispatch(fetchDiscoverPosts()); // Refresh discover feed to update follow status
      Toast.show({ type: 'success', text1: 'Follow status updated' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to update follow status' });
    }
  };`
);

// Add follow button next to user name
code = code.replace(
  /<Text className="text-secondary text-xs mt-0.5">\{new Date\(item\.createdAt\)\.toLocaleDateString\(undefined, \{ month: 'short', day: 'numeric', year: 'numeric' \}\)\}<\/Text>\s*<\/View>\s*<\/View>\s*<TouchableOpacity>\s*<Ionicons name="ellipsis-horizontal" size=\{16\} color=\{theme\.outlineVariant\} \/>\s*<\/TouchableOpacity>\s*<\/View>/,
  `<Text className="text-secondary text-xs mt-0.5">{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            {item.user?.id !== user?.id && (
              <TouchableOpacity 
                onPress={() => handleFollow(item.user.id)}
                className={\`px-3 py-1 rounded-full \${item.isFollowing ? 'bg-surface-container border border-outline-variant' : 'bg-primary'}\`}
              >
                <Text className={\`text-xs font-semibold \${item.isFollowing ? 'text-on-surface' : 'text-on-primary'}\`}>
                  {item.isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={16} color={theme.outlineVariant} />
            </TouchableOpacity>
          </View>
        </View>`
);

fs.writeFileSync('frontend/app/(tabs)/home.tsx', code);
