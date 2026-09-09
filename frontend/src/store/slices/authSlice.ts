import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      await SecureStore.setItemAsync('token', response.data.data.token);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      await SecureStore.setItemAsync('token', response.data.data.token);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error: any) {
      await SecureStore.deleteItemAsync('token');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await SecureStore.deleteItemAsync('token');
    try {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
      });
      await GoogleSignin.signOut();
    } catch (e) {
      // Ignore error if not signed in
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (profileData.name) formData.append('name', profileData.name);
      if (profileData.bio) formData.append('bio', profileData.bio);
      
      if (profileData.imageUri) {
        const localUri = profileData.imageUri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        let type = match ? `image/${match[1]}` : `image/jpeg`;
        if (type === 'image/jpg') type = 'image/jpeg';
        formData.append('profileImage', { uri: localUri, name: filename || 'upload.jpg', type } as any);
      }

      const response = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

interface AuthState {
  user: any;
  token: string | null;
  loading: boolean;
  error: any;
  isAuthenticated: boolean;
  isFirstLaunch: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isFirstLaunch: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setFirstLaunch: (state, action) => {
      state.isFirstLaunch = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchMe.pending, (state) => {
        // loading state during initial session check
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setFirstLaunch, setLoading, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
