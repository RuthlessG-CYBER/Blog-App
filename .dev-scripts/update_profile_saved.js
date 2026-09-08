const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/profile.tsx', 'utf8');

// 1. imports
code = code.replace(
  "fetchPosts, deletePost, toggleLikePost",
  "fetchPosts, deletePost, toggleLikePost, fetchSavedPosts, toggleSavePost"
);
code = code.replace(
  "import React, { useEffect, useState }",
  "import React, { useEffect, useState }"
); // Already there

// 2. Add state for active tab and get savedPosts from Redux
code = code.replace(
  "const { posts: userPosts, loading } = useAppSelector((state) => state.posts);",
  "const { posts: userPosts, savedPosts, loading } = useAppSelector((state) => state.posts);\n  const [activeTab, setActiveTab] = useState<'Stories' | 'Saved'>('Stories');"
);

// 3. fetch data based on tab
code = code.replace(
  "useEffect(() => {\n    dispatch(fetchPosts());\n  }, [dispatch]);",
  `useEffect(() => {
    if (activeTab === 'Stories') {
      dispatch(fetchPosts());
    } else {
      dispatch(fetchSavedPosts());
    }
  }, [dispatch, activeTab]);`
);

// 4. Update the tabs UI to be touchable and change active style
const newTabs = `          <View className="flex-row items-center border-b border-surface-container-high px-margin-mobile gap-6">
            <TouchableOpacity onPress={() => setActiveTab('Stories')} className={\`py-space-sm border-b-2 \${activeTab === 'Stories' ? 'border-primary' : 'border-transparent'}\`}>
              <Text className={\`font-medium text-sm \${activeTab === 'Stories' ? 'text-primary' : 'text-secondary'}\`}>
                Stories ({user?.postsCount || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Saved')} className={\`py-space-sm border-b-2 \${activeTab === 'Saved' ? 'border-primary' : 'border-transparent'}\`}>
              <Text className={\`font-medium text-sm \${activeTab === 'Saved' ? 'text-primary' : 'text-secondary'}\`}>
                Saved
              </Text>
            </TouchableOpacity>
          </View>`;

code = code.replace(/<View className="flex-row items-center border-b border-surface-container-high px-margin-mobile gap-6">[\s\S]*?<\/View>\s*<\/View>\s*<\/View>/m, newTabs + "\n        </View>\n      </View>");

// 5. Update data mapped
code = code.replace(
  "userPosts.length === 0",
  "(activeTab === 'Stories' ? userPosts : savedPosts).length === 0"
);
code = code.replace(
  "userPosts.length > 0",
  "(activeTab === 'Stories' ? userPosts : savedPosts).length > 0"
);
code = code.replace(
  "userPosts.map",
  "(activeTab === 'Stories' ? userPosts : savedPosts).map"
);
code = code.replace(
  "index !== userPosts.length - 1",
  "index !== (activeTab === 'Stories' ? userPosts : savedPosts).length - 1"
);

// 6. Fix Bookmark icon render
code = code.replace(
  /<Ionicons\s*name="bookmark-outline"\s*size=\{16\}\s*color=\{theme\.outlineVariant\}\s*\/>/g,
  `<TouchableOpacity onPress={() => dispatch(toggleSavePost(item.id) as any)}>
                      <Ionicons
                        name={item.isSaved ? "bookmark" : "bookmark-outline"}
                        size={16}
                        color={item.isSaved ? theme.primary : theme.outlineVariant}
                      />
                    </TouchableOpacity>`
);

fs.writeFileSync('frontend/app/(tabs)/profile.tsx', code);
