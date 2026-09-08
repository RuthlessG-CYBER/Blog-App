const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/home.tsx', 'utf8');

const regex = /<Ionicons\s*name="bookmark-outline"\s*size=\{16\}\s*color=\{theme\.outlineVariant\}\s*\/>/m;

const replacement = `<TouchableOpacity onPress={() => dispatch(toggleSavePost(item.id) as any)}>
            <Ionicons 
              name={item.isSaved ? "bookmark" : "bookmark-outline"} 
              size={16} 
              color={item.isSaved ? theme.primary : theme.outlineVariant} 
            />
          </TouchableOpacity>`;

code = code.replace(regex, replacement);
fs.writeFileSync('frontend/app/(tabs)/home.tsx', code);
