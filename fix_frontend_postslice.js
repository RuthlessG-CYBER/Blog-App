const fs = require('fs');
let code = fs.readFileSync('frontend/src/store/slices/postSlice.ts', 'utf8');

// Add fetchFollowingPosts thunk
const followingThunk = `export const fetchFollowingPosts = createAsyncThunk(
  'posts/fetchFollowingPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts/feed/following');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);\n\n`;

code = code.replace("export const fetchDiscoverPosts", followingThunk + "export const fetchDiscoverPosts");

// Update initial state
code = code.replace(
  "discoverPosts: [],",
  "discoverPosts: [],\n    followingPosts: [],"
);

// Add cases in extraReducers
const followingCases = `      .addCase(fetchFollowingPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFollowingPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.followingPosts = action.payload;
      })
      .addCase(fetchFollowingPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      })\n`;

code = code.replace("      .addCase(fetchDiscoverPosts.pending", followingCases + "      .addCase(fetchDiscoverPosts.pending");

// Update handleLike for followingPosts
code = code.replace(
  "const discoverIndex = state.discoverPosts.findIndex((p: any) => p.id === action.payload.id);",
  `const discoverIndex = state.discoverPosts.findIndex((p: any) => p.id === action.payload.id);
        const followingIndex = state.followingPosts.findIndex((p: any) => p.id === action.payload.id);
        if (followingIndex !== -1) {
          state.followingPosts[followingIndex] = action.payload as never;
        }`
);

// Update like count in toggleLike
code = code.replace(
  "const discoverIndex = state.discoverPosts.findIndex((p: any) => p.id === postId);",
  `const discoverIndex = state.discoverPosts.findIndex((p: any) => p.id === postId);
        const followingIndex = state.followingPosts.findIndex((p: any) => p.id === postId);
        if (followingIndex !== -1) {
          const post = state.followingPosts[followingIndex] as any;
          post.isLiked = isLiked;
          post.likesCount = isLiked ? (post.likesCount || 0) + 1 : Math.max((post.likesCount || 0) - 1, 0);
        }`
);

// Update isFollowing locally in updateFollowState
code = code.replace(
  "state.discoverPosts.forEach((post: any) => {",
  `state.discoverPosts.forEach((post: any) => {
        if (post.user?.id === targetUserId) {
          post.isFollowing = isFollowing;
        }
      });
      state.followingPosts.forEach((post: any) => {`
);


fs.writeFileSync('frontend/src/store/slices/postSlice.ts', code);
