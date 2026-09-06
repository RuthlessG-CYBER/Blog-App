import React, { useState } from 'react';
import { useTheme } from '../../src/utils/theme';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { registerUser, setCredentials } from '../../src/store/slices/authSlice';
import api from '../../src/api';
import * as SecureStore from 'expo-secure-store';
import { BlurView } from 'expo-blur';
import Toast from 'react-native-toast-message';

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signupStatus, setSignupStatus] = useState<'idle' | 'creating' | 'success'>('idle');

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const score = (hasLength ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSymbol ? 1 : 0);
  
  let strengthText = 'Gentle';
  let strengthBgClass = 'bg-surface-container-highest';
  let strengthTextClass = 'text-secondary';
  
  if (score === 3) {
    strengthText = 'Robust';
    strengthBgClass = 'bg-primary';
    strengthTextClass = 'text-on-primary';
  } else if (score === 2) {
    strengthText = 'Steady';
    strengthBgClass = 'bg-primary/20 border border-primary/30';
    strengthTextClass = 'text-primary';
  }

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all fields',
        position: 'bottom',
      });
      return;
    }
    if (!passwordsMatch) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
        position: 'bottom',
      });
      return;
    }
    if (!termsAccepted) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please accept the Terms of Service',
        position: 'bottom',
      });
      return;
    }

    try {
      setSignupStatus('creating');
      const response = await api.post('/auth/register', { name, email, password });
      await SecureStore.setItemAsync('token', response.data.data.token);
      
      setSignupStatus('success');
      setTimeout(async () => {
        setSignupStatus('idle');
        dispatch(setCredentials(response.data.data));
      }, 2500);
    } catch (err: any) {
      setSignupStatus('idle');
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: err.response?.data?.message || err.message || 'Something went wrong',
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
        <ScrollView contentContainerClassName="flex-grow px-margin-mobile py-8" keyboardShouldPersistTaps="handled">
          
          <View className="mb-10 mt-2">
            <View className="flex-row items-center gap-2 mb-6">
              <View className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Ionicons name="journal" size={16} color={theme.primary} />
              </View>
              <Text className="font-sans text-primary font-bold tracking-widest text-xs uppercase">Chronicle</Text>
            </View>
            <Text className="font-sans text-4xl font-extrabold text-on-surface tracking-tighter mb-2">
              Join the circle.
            </Text>
            <Text className="font-sans text-base text-secondary leading-relaxed max-w-[280px]">
              Start your mindful writing habit today.
            </Text>
          </View>
          
          <View className="flex-col gap-4 mb-6">
            <View>
              <Text className="font-sans text-sm font-medium text-on-surface mb-1.5">Full Name</Text>
              <View className={`relative flex-row items-center rounded-xl bg-surface-container-highest shadow-sm border h-14 px-3 ${isNameFocused ? 'border-primary' : 'border-outline-variant'}`}>
                <Ionicons name="person" size={20} color={isNameFocused ? theme.primary : theme.outline} />
                <TextInput 
                  className="flex-1 h-full pl-3 font-medium text-on-surface"
                  placeholder="Elena Vance"
                  placeholderTextColor={theme.secondary}
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                />
              </View>
            </View>

            <View>
              <Text className="font-sans text-sm font-medium text-on-surface mb-1.5">Email address</Text>
              <View className={`relative flex-row items-center rounded-xl bg-surface-container-highest shadow-sm border h-14 px-3 ${isEmailFocused ? 'border-primary' : 'border-outline-variant'}`}>
                <Ionicons name="mail" size={20} color={isEmailFocused ? theme.primary : theme.outline} />
                <TextInput 
                  className="flex-1 h-full pl-3 font-medium text-on-surface"
                  placeholder="elena@example.com"
                  placeholderTextColor={theme.secondary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>
            </View>

            <View>
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="font-sans text-sm font-medium text-on-surface">Password</Text>
                <View className={`px-2 py-0.5 rounded-full ${strengthBgClass}`}>
                  <Text className={`text-[10px] uppercase tracking-wider font-bold ${strengthTextClass}`}>{strengthText}</Text>
                </View>
              </View>
              <View className={`relative flex-row items-center rounded-xl bg-surface-container-highest shadow-sm border h-14 px-3 ${isPasswordFocused ? 'border-primary' : 'border-outline-variant'}`}>
                <Ionicons name="lock-closed" size={20} color={isPasswordFocused ? theme.primary : theme.outline} />
                <TextInput 
                  className="flex-1 h-full pl-3 font-medium text-on-surface tracking-wider"
                  placeholder="Create a strong password"
                  placeholderTextColor={theme.secondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="h-full justify-center px-1">
                  <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color={theme.outline} />
                </TouchableOpacity>
              </View>
              
              <View className="pt-3 pb-1">
                <View className="flex-row gap-1.5 h-1.5 w-full mb-3">
                  <View className={`flex-1 rounded-full ${hasLength ? 'bg-primary' : 'bg-outline-variant'}`} />
                  <View className={`flex-1 rounded-full ${hasNumber ? 'bg-primary' : 'bg-outline-variant'}`} />
                  <View className={`flex-1 rounded-full ${hasSymbol ? 'bg-primary' : 'bg-outline-variant'}`} />
                </View>
                <View className="flex-row flex-wrap gap-x-4 gap-y-1">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name={hasLength ? "checkmark-circle" : "radio-button-off"} size={14} color={hasLength ? theme.primary : theme.outline} />
                    <Text className={`text-[11px] ${hasLength ? 'text-primary' : 'text-outline'}`}>8+ characters</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name={hasNumber ? "checkmark-circle" : "radio-button-off"} size={14} color={hasNumber ? theme.primary : theme.outline} />
                    <Text className={`text-[11px] ${hasNumber ? 'text-primary' : 'text-outline'}`}>One number</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name={hasSymbol ? "checkmark-circle" : "radio-button-off"} size={14} color={hasSymbol ? theme.primary : theme.outline} />
                    <Text className={`text-[11px] ${hasSymbol ? 'text-primary' : 'text-outline'}`}>One symbol</Text>
                  </View>
                </View>
              </View>
            </View>

            <View>
              <Text className="font-sans text-sm font-medium text-on-surface mb-1.5">Confirm Password</Text>
              <View className={`relative flex-row items-center rounded-xl bg-surface-container-highest shadow-sm border h-14 px-3 ${isConfirmPasswordFocused ? 'border-primary' : 'border-outline-variant'}`}>
                <Ionicons name="checkmark-done-circle" size={20} color={isConfirmPasswordFocused ? theme.primary : theme.outline} />
                <TextInput 
                  className="flex-1 h-full pl-3 font-medium text-on-surface tracking-wider"
                  placeholder="Re-enter your password"
                  placeholderTextColor={theme.secondary}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => setIsConfirmPasswordFocused(false)}
                />
                {passwordsMatch && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                )}
              </View>
            </View>

            <TouchableOpacity 
              className="flex-row items-start gap-2 pt-2"
              onPress={() => setTermsAccepted(!termsAccepted)}
              activeOpacity={0.8}
            >
              <View className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 ${termsAccepted ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant'}`}>
                {termsAccepted && <Ionicons name="checkmark" size={14} color={theme.onPrimary} />}
              </View>
              <Text className="font-sans flex-1 text-sm text-secondary leading-snug">
                By signing up, you agree to Chronicle's <Text className="font-sans text-primary underline">Terms of Service</Text> and <Text className="font-sans text-primary underline">Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            className={`w-full h-14 rounded-xl flex-row justify-center items-center mt-2 shadow-sm ${signupStatus !== 'idle' ? 'bg-primary/50' : 'bg-primary'}`}
            onPress={handleSignup}
            disabled={signupStatus !== 'idle'}
          >
            <Text className="text-on-primary text-base font-bold mr-2">Create Account</Text>
            {signupStatus === 'idle' && <Ionicons name="arrow-forward" size={19} color={theme.onPrimary} />}
          </TouchableOpacity>

          <View className="flex-row items-center justify-center my-6">
            <View className="flex-1 h-px bg-outline-variant" />
            <Text className="px-3 text-xs text-secondary font-medium">or sign up with</Text>
            <View className="flex-1 h-px bg-outline-variant" />
          </View>

          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity className="flex-1 h-14 rounded-xl bg-surface-container-highest border border-outline-variant flex-row items-center justify-center gap-2 shadow-sm">
              <Ionicons name="logo-apple" size={18} color={theme.onSurface} />
              <Text className="text-on-surface font-medium text-[15px]">Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 h-14 rounded-xl bg-surface-container-highest border border-outline-variant flex-row items-center justify-center gap-2 shadow-sm">
              <Ionicons name="logo-google" size={18} color={theme.onSurface} />
              <Text className="text-on-surface font-medium text-[15px]">Google</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center pb-4">
            <Text className="text-sm text-secondary">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
              <Text className="text-sm text-primary font-bold">Log In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={signupStatus !== 'idle'} transparent animationType="fade">
        <BlurView intensity={40} tint="dark" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View className="bg-surface w-full p-8 rounded-3xl items-center shadow-lg">
            {signupStatus === 'creating' ? (
              <>
                <Ionicons name="person-add-outline" size={64} color={theme.primary} className="mb-4" />
                <Text className="text-xl font-bold text-on-surface mb-2 tracking-tight">Creating Account...</Text>
                <Text className="text-sm text-secondary text-center leading-relaxed">Please wait while we set up your profile.</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={64} color={theme.primary} className="mb-4" />
                <Text className="text-xl font-bold text-on-surface mb-2 tracking-tight">Welcome!</Text>
                <Text className="text-sm text-secondary text-center leading-relaxed">Your account has been successfully created.</Text>
              </>
            )}
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}
