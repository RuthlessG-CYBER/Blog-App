const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/profile.tsx', 'utf8');

const regex = /<View className="w-full bg-surface border-b border-surface-container items-center flex">[\s\S]*?<\/View>\n\s*<\/View>/m;

const replacement = `<View className="w-full bg-surface border-b border-surface-container">
          <View className="flex-row items-center w-full">
            <TouchableOpacity onPress={() => setActiveTab('Stories')} className={\`flex-1 items-center py-space-sm border-b-2 \${activeTab === 'Stories' ? 'border-primary' : 'border-transparent'}\`}>
              <Text className={\`font-medium text-sm \${activeTab === 'Stories' ? 'text-primary' : 'text-secondary'}\`}>
                Stories ({user?.postsCount || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Saved')} className={\`flex-1 items-center py-space-sm border-b-2 \${activeTab === 'Saved' ? 'border-primary' : 'border-transparent'}\`}>
              <Text className={\`font-medium text-sm \${activeTab === 'Saved' ? 'text-primary' : 'text-secondary'}\`}>
                Saved ({savedPosts?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>
        </View>`;

code = code.replace(regex, replacement);
fs.writeFileSync('frontend/app/(tabs)/profile.tsx', code);
