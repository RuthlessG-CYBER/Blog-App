import React, { useState } from 'react';
import { useTheme } from '../../src/utils/theme';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { loginUser, setCredentials } from '../../src/store/slices/authSlice';
import api from '../../src/api';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    });
  }, []);

  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'logging_in' | 'success'>('idle');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      
      if (!idToken) {
         throw new Error('No ID token found');
      }

      setLoginStatus('logging_in');
      const response = await api.post('/auth/google', { token: idToken });
      await SecureStore.setItemAsync('token', response.data.data.token);
      
      setLoginStatus('success');
      setTimeout(async () => {
        setLoginStatus('idle');
        dispatch(setCredentials(response.data.data));
      }, 1000);

    } catch (error: any) {
      setLoginStatus('idle');
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        Toast.show({ type: 'error', text1: 'Error', text2: 'Play services not available' });
      } else {
        Toast.show({ type: 'error', text1: 'Google Login Failed', text2: error.message || 'Something went wrong' });
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all fields',
        position: 'bottom',
      });
      return;
    }
    
    try {
      // Show authenticating state for 3 seconds before hitting the API
      setLoginStatus('logging_in');
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await api.post('/auth/login', { email, password });
      await SecureStore.setItemAsync('token', response.data.data.token);
      
      setLoginStatus('success');
      setTimeout(async () => {
        setLoginStatus('idle');
        dispatch(setCredentials(response.data.data));
      }, 1000);
    } catch (err: any) {
      setLoginStatus('idle');
      
      let msg = err.response?.data?.message || err.message || 'Something went wrong';
      if (err.response?.status === 401) {
        msg = 'Incorrect password';
      }

      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: msg,
        position: 'bottom',
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface relative overflow-hidden">
      {/* Subtle Non-Colorful Background Effects */}
      <View className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-surface-container-high opacity-50 pointer-events-none" />
      <View className="absolute top-[40%] -right-40 w-[28rem] h-[28rem] rounded-full bg-surface-container-highest opacity-40 pointer-events-none" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="flex-grow justify-center px-margin-mobile py-8" keyboardShouldPersistTaps="handled">
          
          <View className="mb-10 mt-2">
            <View className="flex-row items-center gap-2 mb-6">
              <View className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Ionicons name="journal" size={16} color={theme.primary} />
              </View>
              <Text className="font-sans text-primary font-bold tracking-widest text-xs uppercase">Chronicle</Text>
            </View>
            <Text className="font-sans text-4xl font-extrabold text-on-surface tracking-tighter mb-2">
              Welcome back.
            </Text>
            <Text className="font-sans text-base text-secondary leading-relaxed max-w-[280px]">
              Resume your mindful journal and curated writings.
            </Text>
          </View>
          
          <View className="mb-4">
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-sans font-semibold text-sm text-on-surface">Email address</Text>
                <Text className={`text-xs ${email.length === 0 ? 'text-secondary' : isEmailValid ? 'text-primary font-semibold' : 'text-error'}`}>
                  {email.length === 0 ? 'Personal or work' : isEmailValid ? 'Valid format' : 'Enter a valid address'}
                </Text>
              </View>
              <View className={`relative flex-row items-center border rounded-xl h-14 bg-surface-container-highest ${isEmailFocused ? 'border-primary' : 'border-outline-variant'}`}>
                <View className="pl-3 pr-2">
                  <Ionicons name="mail" size={20} color={isEmailFocused ? theme.primary : theme.outline} />
                </View>
                <TextInput 
                  className="flex-1 text-on-surface text-base h-full"
                  placeholder="you@example.com"
                  placeholderTextColor={theme.secondary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
                {isEmailValid && (
                  <View className="pr-3">
                    <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                  </View>
                )}
              </View>
            </View>

            <View className="mb-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-sans font-semibold text-sm text-on-surface">Password</Text>
                <TouchableOpacity>
                  <Text className="font-sans text-xs font-medium text-primary">Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View className={`relative flex-row items-center border rounded-xl h-14 bg-surface-container-highest ${isPasswordFocused ? 'border-primary' : 'border-outline-variant'}`}>
                <View className="pl-3 pr-2">
                  <Ionicons name="lock-closed" size={20} color={isPasswordFocused ? theme.primary : theme.outline} />
                </View>
                <TextInput 
                  className="flex-1 text-on-surface text-base h-full tracking-wider"
                  placeholder="••••••••••••"
                  placeholderTextColor={theme.secondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-3 h-full justify-center">
                  <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color={theme.outline} />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center gap-1.5 mt-1 ml-1">
                <View className="w-1.5 h-1.5 rounded-full bg-secondary opacity-60" />
                <Text className="font-sans text-[11px] text-secondary">Minimum 8 characters with a number</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            className={`w-full h-14 rounded-xl flex-row justify-center items-center mt-2 shadow-sm ${loginStatus !== 'idle' ? 'bg-primary/50' : 'bg-primary'}`}
            onPress={handleLogin}
            disabled={loginStatus !== 'idle'}
          >
            <Text className="font-sans text-on-primary text-base font-bold mr-2">Log In</Text>
            {loginStatus === 'idle' && <Ionicons name="arrow-forward" size={19} color={theme.onPrimary} />}
          </TouchableOpacity>

          <View className="relative flex-row items-center justify-center my-8">
            <View className="flex-1 h-px bg-outline-variant" />
            <View className="px-3">
              <Text className="font-sans text-xs text-secondary font-medium tracking-wide">or continue with</Text>
            </View>
            <View className="flex-1 h-px bg-outline-variant" />
          </View>

          <View className="flex-col gap-3 mb-6">
            <TouchableOpacity className="w-full h-14 rounded-xl bg-on-surface flex-row items-center justify-center gap-2 shadow-sm">
              <Ionicons name="logo-apple" size={18} color={theme.background} />
              <Text className="font-sans text-surface text-[15px] font-bold">Continue with Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGoogleLogin} className="w-full h-14 rounded-xl bg-surface-container-highest border border-outline-variant flex-row items-center justify-center gap-2 shadow-sm">
              <Ionicons name="logo-google" size={18} color={theme.onSurface} />
              <Text className="font-sans text-on-surface text-[15px] font-bold">Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center mt-6">
          <Text className="font-sans text-[15px] text-secondary">
            Don&apos;t have an account?{' '}
            <Text onPress={() => router.push('/signup' as any)} className="font-bold text-primary underline">
              Sign Up
            </Text>
          </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={loginStatus !== 'idle'} transparent animationType="fade">
        <BlurView intensity={40} tint="dark" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View className="bg-surface w-full p-8 rounded-3xl items-center shadow-lg">
            {loginStatus === 'logging_in' ? (
              <>
                <Ionicons name="finger-print-outline" size={64} color={theme.primary} className="mb-4" />
                <Text className="font-sans text-xl font-bold text-on-surface mb-2 tracking-tight">Authenticating...</Text>
                <Text className="font-sans text-sm text-secondary text-center leading-relaxed">Please wait while we log you in securely.</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={64} color={theme.primary} className="mb-4" />
                <Text className="font-sans text-xl font-bold text-on-surface mb-2 tracking-tight">Login Successful</Text>
                <Text className="font-sans text-sm text-secondary text-center leading-relaxed">Welcome back to Chronicle!</Text>
              </>
            )}
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}
