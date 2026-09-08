const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/profile.tsx', 'utf8');

// Replace followers count
code = code.replace(
  /<Text className="text-xl font-bold text-on-surface">0<\/Text>\s*<Text className="text-xs text-secondary mt-1">Followers<\/Text>/,
  '<Text className="text-xl font-bold text-on-surface">{user?.followersCount || 0}</Text>\n              <Text className="text-xs text-secondary mt-1">Followers</Text>'
);

// Replace following count
code = code.replace(
  /<Text className="text-xl font-bold text-on-surface">0<\/Text>\s*<Text className="text-xs text-secondary mt-1">Following<\/Text>/,
  '<Text className="text-xl font-bold text-on-surface">{user?.followingCount || 0}</Text>\n              <Text className="text-xs text-secondary mt-1">Following</Text>'
);

// Replace chat bubble hardcoded '0' with item.commentsCount
code = code.replace(
  /<View className="flex-row items-center gap-1.5">\s*<Ionicons\s*name="chatbubble-outline"\s*size=\{16\}\s*color=\{theme.outline\}\s*\/>\s*<Text className="text-xs text-secondary">0<\/Text>\s*<\/View>/g,
  `<TouchableOpacity className="flex-row items-center gap-1.5" onPress={() => router.push(\`/comments?postId=\${item.id}\` as any)}>
                          <Ionicons
                            name="chatbubble-outline"
                            size={16}
                            color={theme.outline}
                          />
                          <Text className="text-xs text-secondary">{item.commentsCount || 0}</Text>
                        </TouchableOpacity>`
);

fs.writeFileSync('frontend/app/(tabs)/profile.tsx', code);
