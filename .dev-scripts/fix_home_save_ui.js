const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/home.tsx', 'utf8');

// Update import to include toggleSavePost
code = code.replace(
  "toggleLikePost, updateFollowState } from '../../src/store/slices/postSlice';",
  "toggleLikePost, toggleSavePost, updateFollowState } from '../../src/store/slices/postSlice';"
);

// Update bookmark icon rendering
code = code.replace(
  '<Ionicons name="bookmark-outline" size={16} color={theme.outlineVariant} />',
  `<TouchableOpacity onPress={() => dispatch(toggleSavePost(item.id) as any)}>
            <Ionicons 
              name={item.isSaved ? "bookmark" : "bookmark-outline"} 
              size={16} 
              color={item.isSaved ? theme.primary : theme.outlineVariant} 
            />
          </TouchableOpacity>`
);

fs.writeFileSync('frontend/app/(tabs)/home.tsx', code);
