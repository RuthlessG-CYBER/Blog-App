const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/home.tsx', 'utf8');

// Update imports
code = code.replace(
  "import { fetchDiscoverPosts, toggleLikePost } from '../../src/store/slices/postSlice';",
  "import { fetchDiscoverPosts, toggleLikePost, updateFollowState } from '../../src/store/slices/postSlice';"
);

// Update handleFollow definition
code = code.replace(
  /const handleFollow = async \(targetUserId: string\) => \{[\s\S]*?^\s*};\n/m,
  `const handleFollow = async (targetUserId: string, currentIsFollowing: boolean) => {
    // Optimistic UI update
    dispatch(updateFollowState({ targetUserId, isFollowing: !currentIsFollowing }));
    try {
      const res = await toggleFollow(targetUserId);
      dispatch(updateFollowState({ targetUserId, isFollowing: res.data.data.isFollowing }));
      dispatch(fetchMe()); // Refresh user profile to update following count in background
    } catch (error) {
      // Revert on error
      dispatch(updateFollowState({ targetUserId, isFollowing: currentIsFollowing }));
    }
  };\n`
);

// Update onPress to pass currentIsFollowing
code = code.replace(
  "onPress={() => handleFollow(item.user.id)}",
  "onPress={() => handleFollow(item.user.id, item.isFollowing)}"
);

fs.writeFileSync('frontend/app/(tabs)/home.tsx', code);
