const fs = require('fs');
let code = fs.readFileSync('frontend/src/store/slices/postSlice.ts', 'utf8');

code = code.replace(
  'reducers: {},',
  `reducers: {
    updateFollowState: (state, action) => {
      const { targetUserId, isFollowing } = action.payload;
      state.discoverPosts.forEach((post: any) => {
        if (post.user?.id === targetUserId) {
          post.isFollowing = isFollowing;
        }
      });
    }
  },`
);

code = code.replace(
  'export default postSlice.reducer;',
  'export const { updateFollowState } = postSlice.actions;\nexport default postSlice.reducer;'
);

fs.writeFileSync('frontend/src/store/slices/postSlice.ts', code);
