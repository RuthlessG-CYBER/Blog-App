const fs = require('fs');
let code = fs.readFileSync('frontend/src/store/slices/postSlice.ts', 'utf8');

// 1. Add toggleSavePost and fetchSavedPosts thunks
const saveThunks = `export const toggleSavePost = createAsyncThunk(
  'posts/toggleSavePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(\`/posts/\${postId}/save\`);
      return { postId, isSaved: response.data.data.isSaved };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSavedPosts = createAsyncThunk(
  'posts/fetchSavedPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts/saved');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);\n\n`;

code = code.replace("export const toggleLikePost", saveThunks + "export const toggleLikePost");

// 2. Add savedPosts to state
code = code.replace(
  "followingPosts: [],",
  "followingPosts: [],\n    savedPosts: [],"
);

// 3. Handle fetchSavedPosts cases
const saveCases = `      .addCase(fetchSavedPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSavedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPosts = action.payload;
      })
      .addCase(fetchSavedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      })\n`;

code = code.replace("      .addCase(fetchDiscoverPosts.pending", saveCases + "      .addCase(fetchDiscoverPosts.pending");

// 4. Handle toggleSavePost cases
const toggleSaveCases = `      .addCase(toggleSavePost.fulfilled, (state, action) => {
        const { postId, isSaved } = action.payload;
        
        const updateSaved = (arr: any[]) => {
          const index = arr.findIndex((p: any) => p.id === postId);
          if (index !== -1) arr[index].isSaved = isSaved;
        };

        updateSaved(state.posts);
        updateSaved(state.discoverPosts);
        updateSaved(state.followingPosts);
        
        if (!isSaved) {
          state.savedPosts = state.savedPosts.filter((p: any) => p.id !== postId);
        }
      })\n`;

code = code.replace("      .addCase(toggleLikePost.fulfilled, (state, action) => {", toggleSaveCases + "      .addCase(toggleLikePost.fulfilled, (state, action) => {");

fs.writeFileSync('frontend/src/store/slices/postSlice.ts', code);
