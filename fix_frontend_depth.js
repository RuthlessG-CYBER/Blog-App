const fs = require('fs');
let code = fs.readFileSync('frontend/src/store/slices/postSlice.ts', 'utf8');

// Update fetchDiscoverPosts
code = code.replace(
  /export const fetchDiscoverPosts = createAsyncThunk\([\s\S]*?async \(_, \{ rejectWithValue \}\) => \{/m,
  `export const fetchDiscoverPosts = createAsyncThunk(
  'posts/fetchDiscoverPosts',
  async (depth: number = 0, { rejectWithValue }) => {`
);
code = code.replace(
  "const response = await api.get('/posts/feed/discover');",
  "const response = await api.get(`/posts/feed/discover?depth=${depth}`);"
);

// Update fetchFollowingPosts
code = code.replace(
  /export const fetchFollowingPosts = createAsyncThunk\([\s\S]*?async \(_, \{ rejectWithValue \}\) => \{/m,
  `export const fetchFollowingPosts = createAsyncThunk(
  'posts/fetchFollowingPosts',
  async (depth: number = 0, { rejectWithValue }) => {`
);
code = code.replace(
  "const response = await api.get('/posts/feed/following');",
  "const response = await api.get(`/posts/feed/following?depth=${depth}`);"
);

fs.writeFileSync('frontend/src/store/slices/postSlice.ts', code);
