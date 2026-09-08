import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFollowingPosts = createAsyncThunk(
  'posts/fetchFollowingPosts',
  async (depth: number = 0, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/feed/following?depth=${depth}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDiscoverPosts = createAsyncThunk(
  'posts/fetchDiscoverPosts',
  async (depth: number = 0, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/feed/discover?depth=${depth}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/posts', postData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadPostImage = createAsyncThunk(
  'posts/uploadImage',
  async ({ postId, imageUri }: { postId: string; imageUri: string }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      const localUri = imageUri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      let type = match ? `image/${match[1]}` : `image/jpeg`;
      if (type === 'image/jpg') type = 'image/jpeg';

      formData.append('image', { uri: localUri, name: filename || 'upload.jpg', type } as any);

      const response = await api.post(`/posts/${postId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }: { postId: string; postData: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${postId}`, postData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleLikePost = createAsyncThunk(
  'posts/toggleLikePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return { postId, isLiked: response.data.data.isLiked };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    discoverPosts: [],
    followingPosts: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateFollowState: (state, action) => {
      const { targetUserId, isFollowing } = action.payload;
      state.discoverPosts.forEach((post: any) => {
        if (post.user?.id === targetUserId) {
          post.isFollowing = isFollowing;
        }
      });
      state.followingPosts.forEach((post: any) => {
        if (post.user?.id === targetUserId) {
          post.isFollowing = isFollowing;
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      })
      .addCase(fetchFollowingPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFollowingPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.followingPosts = action.payload;
      })
      .addCase(fetchFollowingPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      })
      .addCase(fetchDiscoverPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDiscoverPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.discoverPosts = action.payload;
      })
      .addCase(fetchDiscoverPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload as never);
      })
      .addCase(uploadPostImage.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p: any) => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload as never;
        }
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p: any) => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload as never;
        }
        const discoverIndex = state.discoverPosts.findIndex((p: any) => p.id === action.payload.id);
        const followingIndex = state.followingPosts.findIndex((p: any) => p.id === action.payload.id);
        if (followingIndex !== -1) {
          state.followingPosts[followingIndex] = action.payload as never;
        }
        if (discoverIndex !== -1) {
          state.discoverPosts[discoverIndex] = action.payload as never;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p: any) => p.id !== action.payload);
        state.discoverPosts = state.discoverPosts.filter((p: any) => p.id !== action.payload);
      })
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const { postId, isLiked } = action.payload;
        
        const postIndex = state.posts.findIndex((p: any) => p.id === postId);
        if (postIndex !== -1) {
          const post = state.posts[postIndex] as any;
          post.isLiked = isLiked;
          post.likesCount = isLiked ? (post.likesCount || 0) + 1 : Math.max((post.likesCount || 0) - 1, 0);
        }

        const discoverIndex = state.discoverPosts.findIndex((p: any) => p.id === postId);
        const followingIndex = state.followingPosts.findIndex((p: any) => p.id === postId);
        if (followingIndex !== -1) {
          const post = state.followingPosts[followingIndex] as any;
          post.isLiked = isLiked;
          post.likesCount = isLiked ? (post.likesCount || 0) + 1 : Math.max((post.likesCount || 0) - 1, 0);
        }
        if (discoverIndex !== -1) {
          const post = state.discoverPosts[discoverIndex] as any;
          post.isLiked = isLiked;
          post.likesCount = isLiked ? (post.likesCount || 0) + 1 : Math.max((post.likesCount || 0) - 1, 0);
        }
      });
  },
});

export const { updateFollowState } = postSlice.actions;
export default postSlice.reducer;
